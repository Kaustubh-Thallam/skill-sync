const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

const onboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  companySize: z.string().max(50).optional().nullable(),
});

// ─── PUT /recruiters/onboarding ───
router.put(
  "/onboarding",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const data = onboardingSchema.parse(req.body);

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Recruiter profile not found.");

    const updatedProfile = await prisma.recruiterProfile.update({
      where: { id: profile.id },
      data: {
        companyName: data.companyName,
        companySize: data.companySize || null,
        onboarded: true,
      },
    });

    res.json({ message: "Onboarding complete.", profile: updatedProfile });
  }),
);

// ─── GET /recruiters/me ───
router.get(
  "/me",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        postings: {
          include: {
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        user: { select: { email: true } },
      },
    });
    if (!profile) throw new ApiError(404, "Recruiter profile not found.");

    res.json({ profile });
  }),
);

// ─── PUT /recruiters/profile ───
const profileUpdateSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  companySize: z.string().max(50).optional().nullable(),
});

router.put(
  "/profile",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const data = profileUpdateSchema.parse(req.body);
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Recruiter profile not found.");

    const updateData = {};
    if (data.companyName !== undefined)
      updateData.companyName = data.companyName;
    if (data.companySize !== undefined)
      updateData.companySize = data.companySize;

    const updated = await prisma.recruiterProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    res.json({ message: "Profile updated.", profile: updated });
  }),
);

module.exports = router;
