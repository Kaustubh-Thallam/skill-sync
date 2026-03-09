const express = require("express");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

// ─── GET /candidates/recommendations ───
router.get(
  "/",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: { skills: true },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    let internships = [];
    let projects = [];

    if (profile.skills.length === 0) {
      // No skills → no recommendations (can't match without skills)
      return res.json({
        internships: [],
        projects: [],
        totalInternships: 0,
        totalProjects: 0,
        noSkills: true,
      });
    } else {
      const skillNames = profile.skills.map((s) => s.skillName.toLowerCase());

      const matchingPostings = await prisma.posting.findMany({
        where: { postingSkills: { some: { skillName: { in: skillNames } } } },
        include: {
          postingSkills: true,
          recruiter: { select: { companyName: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const withOverlap = matchingPostings.map((posting) => {
        const overlapCount = posting.postingSkills.filter((ps) =>
          skillNames.includes(ps.skillName.toLowerCase()),
        ).length;
        return { ...posting, overlapCount };
      });

      withOverlap.sort((a, b) => b.overlapCount - a.overlapCount);
      internships = withOverlap.filter((p) => p.type === "INTERNSHIP");
      projects = withOverlap.filter((p) => p.type === "PROJECT");
    }

    res.json({
      internships: internships.slice(0, 10),
      projects: projects.slice(0, 10),
      totalInternships: internships.length,
      totalProjects: projects.length,
    });
  }),
);

module.exports = router;
