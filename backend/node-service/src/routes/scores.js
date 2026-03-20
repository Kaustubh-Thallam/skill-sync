const express = require("express");
const axios = require("axios");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();
const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// Rate limiter for score checks (AI-heavy — 10 per 15 min)
const scoreLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many score check requests. Please try again later.",
});

// ─── POST /scores/check/:postingId ───
router.post(
  "/check/:postingId",
  authenticate,
  requireRole("CANDIDATE"),
  scoreLimiter,
  catchAsync(async (req, res) => {
    const { postingId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: { skills: true },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");
    if (profile.skills.length === 0)
      throw new ApiError(
        400,
        "No skills found. Add skills to your profile first.",
      );

    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
      include: { postingSkills: true },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    if (posting.postingSkills.length === 0)
      throw new ApiError(400, "This posting has no required skills.");

    // Check cache
    const cachedScore = await prisma.matchScore.findUnique({
      where: { candidateId_postingId: { candidateId: profile.id, postingId } },
    });

    if (cachedScore && !cachedScore.isStale) {
      return res.json({
        source: "cache",
        score: cachedScore.score,
        breakdown: cachedScore.breakdown,
        gaps: cachedScore.gaps,
        calculatedAt: cachedScore.calculatedAt,
      });
    }

    try {
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/calculate-score`,
        {
          candidateSkills: profile.skills.map((s) => ({
            skillName: s.skillName,
            proficiency: s.proficiency,
          })),
          postingSkills: posting.postingSkills.map((s) => ({
            skillName: s.skillName,
            weight: s.weight,
          })),
        },
        { timeout: 15000 },
      );

      const { score, breakdown, gaps, projectedScore } = pythonResponse.data;

      const savedScore = await prisma.matchScore.upsert({
        where: {
          candidateId_postingId: { candidateId: profile.id, postingId },
        },
        update: {
          score,
          breakdown,
          gaps,
          isStale: false,
          calculatedAt: new Date(),
        },
        create: {
          candidateId: profile.id,
          postingId,
          score,
          breakdown,
          gaps,
          isStale: false,
        },
      });

      res.json({
        source: "calculated",
        score: savedScore.score,
        breakdown,
        gaps,
        projectedScore,
        calculatedAt: savedScore.calculatedAt,
      });
    } catch (err) {
      if (err.response)
        throw new ApiError(
          err.response.status,
          err.response.data.detail || "Score calculation failed.",
        );
      throw new ApiError(503, "Scoring service temporarily unavailable.");
    }
  }),
);

module.exports = router;
