const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

const createPostingSchema = z.object({
  type: z.enum(["INTERNSHIP", "PROJECT"], {
    errorMap: () => ({ message: "Type must be INTERNSHIP or PROJECT" }),
  }),
  title: z.string().min(1, "Title is required").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  stipend: z.number().int().min(0).optional().nullable(),
  duration: z.string().max(50).optional().nullable(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Deadline must be a valid date string",
  }),
  location: z.string().max(100).optional().nullable(),
  remote: z.boolean().optional().default(false),
  skills: z
    .array(
      z.object({
        skillName: z.string().min(1).max(50),
        weight: z.number().int().min(1).max(5),
        requiredProficiency: z.number().int().min(1).max(5).optional().default(3),
      }),
    )
    .min(1, "At least one required skill must be specified"),
});

const updatePostingSchema = createPostingSchema.partial();

// ─── POST /postings ───
router.post(
  "/",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const data = createPostingSchema.parse(req.body);

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!recruiterProfile)
      throw new ApiError(404, "Recruiter profile not found.");

    const posting = await prisma.posting.create({
      data: {
        recruiterId: recruiterProfile.id,
        type: data.type,
        title: data.title,
        description: data.description,
        stipend: data.stipend || null,
        duration: data.duration || null,
        deadline: new Date(data.deadline),
        location: data.location || null,
        remote: data.remote,
        postingSkills: {
          create: data.skills.map((s) => ({
            skillName: s.skillName.toLowerCase().trim(),
            weight: s.weight,
            requiredProficiency: s.requiredProficiency,
          })),
        },
      },
      include: {
        postingSkills: true,
        recruiter: { select: { companyName: true } },
      },
    });

    res.status(201).json({ message: "Posting created successfully.", posting });
  }),
);

// ─── GET /postings ───
router.get(
  "/",
  catchAsync(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const type = req.query.type ? req.query.type.toUpperCase() : undefined;
    const search = req.query.search || "";
    const remote = req.query.remote;

    const where = {};
    if (type && ["INTERNSHIP", "PROJECT"].includes(type)) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (remote === "true") where.remote = true;

    const [postings, total] = await Promise.all([
      prisma.posting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          postingSkills: true,
          recruiter: { select: { companyName: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.posting.count({ where }),
    ]);

    res.json({
      postings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),
);

// ─── GET /postings/:id ───
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const posting = await prisma.posting.findUnique({
      where: { id: req.params.id },
      include: {
        postingSkills: true,
        recruiter: { select: { companyName: true, companySize: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    res.json({ posting });
  }),
);

// ─── PUT /postings/:id ───
router.put(
  "/:id",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const data = updatePostingSchema.parse(req.body);

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });

    const posting = await prisma.posting.findUnique({
      where: { id: req.params.id },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    if (posting.recruiterId !== recruiterProfile.id)
      throw new ApiError(403, "You can only edit your own postings.");

    const updateData = {};
    if (data.type) updateData.type = data.type;
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.stipend !== undefined) updateData.stipend = data.stipend;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.remote !== undefined) updateData.remote = data.remote;

    await prisma.$transaction(async (tx) => {
      await tx.posting.update({
        where: { id: req.params.id },
        data: updateData,
      });
      if (data.skills) {
        await tx.postingSkill.deleteMany({
          where: { postingId: req.params.id },
        });
        await tx.postingSkill.createMany({
          data: data.skills.map((s) => ({
            postingId: req.params.id,
            skillName: s.skillName.toLowerCase().trim(),
            weight: s.weight,
            requiredProficiency: s.requiredProficiency,
          })),
        });
        await tx.matchScore.updateMany({
          where: { postingId: req.params.id },
          data: { isStale: true },
        });
      }
    });

    const result = await prisma.posting.findUnique({
      where: { id: req.params.id },
      include: {
        postingSkills: true,
        recruiter: { select: { companyName: true } },
      },
    });

    res.json({ message: "Posting updated successfully.", posting: result });
  }),
);

// ─── DELETE /postings/:id ───
router.delete(
  "/:id",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });
    const posting = await prisma.posting.findUnique({
      where: { id: req.params.id },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    if (posting.recruiterId !== recruiterProfile.id)
      throw new ApiError(403, "You can only delete your own postings.");

    await prisma.posting.delete({ where: { id: req.params.id } });
    res.json({ message: "Posting deleted successfully." });
  }),
);

module.exports = router;
