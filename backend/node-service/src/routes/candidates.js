const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new ApiError(400, "Only PDF files are allowed."));
  },
});

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// Rate limiter for resume uploads (AI-heavy — 5 per 15 min)
const resumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many resume uploads. Please try again later.",
});

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  linkedinUrl: z.string().max(200).optional().nullable().or(z.literal("")),
  skills: z
    .array(
      z.object({
        skillName: z.string().min(1).max(50),
        proficiency: z.number().int().min(1).max(5),
      }),
    )
    .min(0, "Skills array is required"),
  projects: z
    .array(
      z.object({
        name: z.string().max(200),
        description: z.string().max(500).optional().default(""),
        skillsUsed: z.string().max(300).optional().default(""),
        role: z.string().max(100).optional().default(""),
      }),
    )
    .optional()
    .default([]),
  experience: z
    .array(
      z.object({
        company: z.string().max(200),
        type: z.string().max(50).optional().default(""),
        role: z.string().max(200).optional().default(""),
        duration: z.string().max(100).optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  linkedinUrl: z.string().max(200).optional().nullable().or(z.literal("")),
  skills: z
    .array(
      z.object({
        skillName: z.string().min(1).max(50),
        proficiency: z.number().int().min(1).max(5),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().max(200),
        description: z.string().max(500).optional().default(""),
        skillsUsed: z.string().max(300).optional().default(""),
        role: z.string().max(100).optional().default(""),
      }),
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string().max(200),
        type: z.string().max(50).optional().default(""),
        role: z.string().max(200).optional().default(""),
        duration: z.string().max(100).optional().default(""),
      }),
    )
    .optional(),
});

// ─── PUT /candidates/onboarding ───
router.put(
  "/onboarding",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const data = onboardingSchema.parse(req.body);

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const updated = await tx.candidateProfile.update({
        where: { id: profile.id },
        data: {
          name: data.name,
          phone: data.phone || null,
          location: data.location || null,
          linkedinUrl: data.linkedinUrl || null,
          projects: data.projects || [],
          experience: data.experience || [],
          onboarded: true,
        },
      });

      await tx.skill.deleteMany({ where: { candidateId: profile.id } });
      await tx.skill.createMany({
        data: data.skills.map((s) => ({
          candidateId: profile.id,
          skillName: s.skillName.toLowerCase().trim(),
          proficiency: s.proficiency,
        })),
      });

      return updated;
    });

    const skills = await prisma.skill.findMany({
      where: { candidateId: profile.id },
    });

    res.json({
      message: "Onboarding complete.",
      profile: updatedProfile,
      skills,
    });
  }),
);

// ─── POST /candidates/resume ───
router.post(
  "/resume",
  authenticate,
  requireRole("CANDIDATE"),
  resumeLimiter,
  upload.single("resume"),
  catchAsync(async (req, res) => {
    if (!req.file)
      throw new ApiError(400, 'No PDF file uploaded. Use field name "resume".');

    try {
      const formData = new FormData();
      formData.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: "application/pdf",
      });

      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/parse-resume`,
        formData,
        { headers: formData.getHeaders(), timeout: 30000 },
      );

      res.json({
        message: "Resume parsed successfully.",
        parsed: pythonResponse.data,
      });
    } catch (err) {
      if (err.response)
        throw new ApiError(
          err.response.status,
          err.response.data.detail || "Resume parsing failed.",
        );
      throw new ApiError(
        503,
        "Resume parsing service temporarily unavailable.",
      );
    }
  }),
);

// ─── PUT /candidates/profile ───
router.put(
  "/profile",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const data = profileUpdateSchema.parse(req.body);

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.linkedinUrl !== undefined)
        updateData.linkedinUrl = data.linkedinUrl;
      if (data.projects !== undefined) updateData.projects = data.projects;
      if (data.experience !== undefined)
        updateData.experience = data.experience;

      const updated = await tx.candidateProfile.update({
        where: { id: profile.id },
        data: updateData,
      });

      if (data.skills) {
        await tx.skill.deleteMany({ where: { candidateId: profile.id } });
        await tx.skill.createMany({
          data: data.skills.map((s) => ({
            candidateId: profile.id,
            skillName: s.skillName.toLowerCase().trim(),
            proficiency: s.proficiency,
          })),
        });
        await tx.matchScore.updateMany({
          where: { candidateId: profile.id },
          data: { isStale: true },
        });
      }

      return updated;
    });

    const skills = await prisma.skill.findMany({
      where: { candidateId: profile.id },
    });

    res.json({
      message: "Profile updated successfully.",
      profile: updatedProfile,
      skills,
    });
  }),
);

// ─── GET /candidates/me ───
router.get(
  "/me",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: { skills: true, user: { select: { email: true } } },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    res.json({ profile });
  }),
);

module.exports = router;
