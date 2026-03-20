const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// Graceful shutdown — disconnect on process termination to avoid stale connections
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
