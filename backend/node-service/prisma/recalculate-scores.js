/**
 * Recalculate all existing match scores using the updated formula.
 *
 * This script fetches all MatchScore records, calls the Python service
 * to recalculate each one with the new requirement-aware formula, and
 * updates the database.
 *
 * Run: node prisma/recalculate-scores.js
 * Requires: Python service running at PYTHON_SERVICE_URL
 */
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

const prisma = new PrismaClient();
const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

async function main() {
  console.log("🔄 Recalculating all match scores with updated formula...\n");

  const matchScores = await prisma.matchScore.findMany({
    include: {
      candidate: { include: { skills: true } },
      posting: { include: { postingSkills: true } },
    },
  });

  console.log(`Found ${matchScores.length} existing match scores to recalculate.\n`);

  let success = 0;
  let failed = 0;

  for (const ms of matchScores) {
    const { candidate, posting } = ms;

    if (!candidate || !posting || candidate.skills.length === 0 || posting.postingSkills.length === 0) {
      console.log(`⏭️  Skipping ${ms.id} — missing candidate/posting/skills data`);
      failed++;
      continue;
    }

    try {
      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/calculate-score`,
        {
          candidateSkills: candidate.skills.map((s) => ({
            skillName: s.skillName,
            proficiency: s.proficiency,
          })),
          postingSkills: posting.postingSkills.map((s) => ({
            skillName: s.skillName,
            weight: s.weight,
            requiredProficiency: s.requiredProficiency,
          })),
        },
        { timeout: 15000 },
      );

      const { score, breakdown, gaps } = response.data;

      await prisma.matchScore.update({
        where: { id: ms.id },
        data: {
          score,
          breakdown,
          gaps,
          isStale: false,
          calculatedAt: new Date(),
        },
      });

      console.log(
        `✅ ${candidate.name || candidate.id} × ${posting.title}: ${ms.score}% → ${score}%`,
      );
      success++;
    } catch (err) {
      console.error(
        `❌ Failed for ${ms.id}: ${err.response?.data?.detail || err.message}`,
      );
      failed++;
    }
  }

  console.log(`\n🏁 Done! ${success} recalculated, ${failed} failed.`);
}

main()
  .catch((e) => {
    console.error("Recalculation script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
