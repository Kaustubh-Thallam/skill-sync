const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole("ADMIN"));

// ─── GET /admin/stats ───
router.get(
  "/stats",
  catchAsync(async (req, res) => {
    const [candidates, recruiters, admins, postings] = await Promise.all([
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.user.count({ where: { role: "RECRUITER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.posting.count(),
    ]);
    res.json({ candidates, recruiters, admins, postings });
  }),
);

// ─── GET /admin/users ───
router.get(
  "/users",
  catchAsync(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { role: "CANDIDATE" },
      select: {
        id: true,
        email: true,
        createdAt: true,
        candidateProfile: {
          include: { skills: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  }),
);

// ─── GET /admin/recruiters ───
router.get(
  "/recruiters",
  catchAsync(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { role: "RECRUITER" },
      select: {
        id: true,
        email: true,
        createdAt: true,
        recruiterProfile: {
          include: {
            postings: { select: { id: true, title: true, type: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  }),
);

// ─── GET /admin/users/:id ───
router.get(
  "/users/:id",
  catchAsync(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        candidateProfile: { include: { skills: true } },
        recruiterProfile: true,
      },
    });
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ user });
  }),
);

// ─── PUT /admin/users/:id ───
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  companyName: z.string().max(100).optional(),
  companySize: z.string().max(50).optional().nullable(),
});

router.put(
  "/users/:id",
  catchAsync(async (req, res) => {
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { candidateProfile: true, recruiterProfile: true },
    });
    if (!user) throw new ApiError(404, "User not found.");

    // Update email if provided
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) throw new ApiError(409, "Email already in use.");
      await prisma.user.update({
        where: { id: user.id },
        data: { email: data.email },
      });
    }

    // Update candidate profile
    if (user.candidateProfile) {
      await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.location !== undefined && { location: data.location }),
        },
      });
    }

    // Update recruiter profile
    if (user.recruiterProfile) {
      await prisma.recruiterProfile.update({
        where: { id: user.recruiterProfile.id },
        data: {
          ...(data.companyName !== undefined && {
            companyName: data.companyName,
          }),
          ...(data.companySize !== undefined && {
            companySize: data.companySize,
          }),
        },
      });
    }

    res.json({ message: "User updated successfully." });
  }),
);

// ─── PUT /admin/users/:id/password ───
const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

router.put(
  "/users/:id/password",
  catchAsync(async (req, res) => {
    const data = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new ApiError(404, "User not found.");

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ message: "Password updated successfully." });
  }),
);

// ─── DELETE /admin/users/:id ───
router.delete(
  "/users/:id",
  catchAsync(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new ApiError(404, "User not found.");
    if (user.id === req.user.id)
      throw new ApiError(400, "Cannot delete yourself.");

    await prisma.user.delete({ where: { id: user.id } });
    res.json({ message: "User deleted successfully." });
  }),
);

// ─── GET /admin/postings ───
router.get(
  "/postings",
  catchAsync(async (req, res) => {
    const postings = await prisma.posting.findMany({
      include: {
        recruiter: { select: { companyName: true } },
        postingSkills: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ postings });
  }),
);

// ─── DELETE /admin/postings/:id ───
router.delete(
  "/postings/:id",
  catchAsync(async (req, res) => {
    const posting = await prisma.posting.findUnique({
      where: { id: req.params.id },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");

    await prisma.posting.delete({ where: { id: posting.id } });
    res.json({ message: "Posting deleted successfully." });
  }),
);

// ─── GET /admin/admins ───
router.get(
  "/admins",
  catchAsync(async (req, res) => {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ admins });
  }),
);

// ─── POST /admin/admins ───
const createAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

router.post(
  "/admins",
  catchAsync(async (req, res) => {
    const data = createAdminSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing)
      throw new ApiError(409, "An account with this email already exists.");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const admin = await prisma.user.create({
      data: { email: data.email, passwordHash, role: "ADMIN" },
    });

    res.status(201).json({
      message: "Admin created successfully.",
      admin: { id: admin.id, email: admin.email },
    });
  }),
);

// ─── DELETE /admin/admins/:id ───
router.delete(
  "/admins/:id",
  catchAsync(async (req, res) => {
    const admin = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!admin) throw new ApiError(404, "Admin not found.");
    if (admin.role !== "ADMIN")
      throw new ApiError(400, "User is not an admin.");
    if (admin.id === req.user.id)
      throw new ApiError(400, "Cannot delete yourself.");

    await prisma.user.delete({ where: { id: admin.id } });
    res.json({ message: "Admin deleted successfully." });
  }),
);

router.get(
  "/users/:id/full",
  catchAsync(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        candidateProfile: { include: { skills: true } },
        recruiterProfile: true,
      },
    });
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ user });
  }),
);

// ─── PUT /admin/users/:id/full — Full candidate profile update ───
const fullProfileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  linkedinUrl: z.string().max(300).optional().nullable().or(z.literal("")),
  skills: z
    .array(
      z.object({
        skillName: z.string().min(1).max(50),
        proficiency: z
          .union([z.string(), z.number()])
          .transform((v) => parseInt(v, 10) || 1),
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
        role: z.string().max(200).optional().default(""),
        duration: z.string().max(100).optional().default(""),
        description: z.string().max(500).optional().default(""),
      }),
    )
    .optional(),
  companyName: z.string().max(200).optional(),
  companySize: z.string().max(50).optional().nullable(),
});

router.put(
  "/users/:id/full",
  catchAsync(async (req, res) => {
    const data = fullProfileSchema.parse(req.body);
    const {
      email,
      name,
      phone,
      location,
      linkedinUrl,
      skills,
      projects,
      experience,
    } = data;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { candidateProfile: true, recruiterProfile: true },
    });
    if (!user) throw new ApiError(404, "User not found.");

    // Update email if changed
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new ApiError(409, "Email already in use.");
      await prisma.user.update({ where: { id: user.id }, data: { email } });
    }

    // Update candidate profile
    if (user.candidateProfile) {
      await prisma.candidateProfile.update({
        where: { id: user.candidateProfile.id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(location !== undefined && { location: location || null }),
          ...(linkedinUrl !== undefined && {
            linkedinUrl: linkedinUrl || null,
          }),
          ...(projects !== undefined && { projects }),
          ...(experience !== undefined && { experience }),
        },
      });

      // Replace skills if provided
      if (skills !== undefined && Array.isArray(skills)) {
        await prisma.skill.deleteMany({
          where: { candidateId: user.candidateProfile.id },
        });
        if (skills.length > 0) {
          await prisma.skill.createMany({
            data: skills.map((s) => ({
              candidateId: user.candidateProfile.id,
              skillName: s.skillName,
              proficiency: parseInt(s.proficiency, 10) || 1,
            })),
          });
        }
      }
    }

    // Update recruiter profile
    if (user.recruiterProfile) {
      const { companyName, companySize } = data;
      await prisma.recruiterProfile.update({
        where: { id: user.recruiterProfile.id },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(companySize !== undefined && { companySize }),
        },
      });
    }

    res.json({ message: "User profile updated successfully." });
  }),
);

// ─── GET /admin/me — Admin's own profile ───
router.get(
  "/me",
  catchAsync(async (req, res) => {
    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, createdAt: true },
    });
    res.json({ admin });
  }),
);

// ─── PUT /admin/me — Update admin's own profile ───
const adminSelfUpdateSchema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

router.put(
  "/me",
  catchAsync(async (req, res) => {
    const data = adminSelfUpdateSchema.parse(req.body);
    const { email, currentPassword, newPassword } = data;
    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!admin) throw new ApiError(404, "Admin not found.");

    // Update email
    if (email && email !== admin.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new ApiError(409, "Email already in use.");
      await prisma.user.update({ where: { id: admin.id }, data: { email } });
    }

    // Change password (requires current password)
    if (newPassword) {
      if (!currentPassword)
        throw new ApiError(
          400,
          "Current password is required to change password.",
        );
      const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!valid) throw new ApiError(401, "Current password is incorrect.");
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash },
      });
    }

    res.json({ message: "Profile updated successfully." });
  }),
);

module.exports = router;
