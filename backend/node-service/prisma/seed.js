const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.application.deleteMany();
  await prisma.matchScore.deleteMany();
  await prisma.postingSkill.deleteMany();
  await prisma.posting.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const recruiter1 = await prisma.user.create({
    data: {
      email: "recruiter1@techcorp.com",
      passwordHash,
      role: "RECRUITER",
      recruiterProfile: {
        create: {
          companyName: "TechCorp",
          companySize: "100-500",
          onboarded: true,
        },
      },
    },
    include: { recruiterProfile: true },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: "recruiter2@startupai.com",
      passwordHash,
      role: "RECRUITER",
      recruiterProfile: {
        create: {
          companyName: "StartupAI",
          companySize: "10-50",
          onboarded: true,
        },
      },
    },
    include: { recruiterProfile: true },
  });

  const postings = [
    {
      recruiterId: recruiter1.recruiterProfile.id,
      type: "INTERNSHIP",
      title: "Backend Developer Intern",
      description:
        "Build REST APIs with Node.js and PostgreSQL. Must know Python for data tasks.",
      stipend: 1500,
      duration: "3 months",
      deadline: new Date("2026-06-01"),
      location: "San Francisco, CA",
      remote: true,
      skills: [
        { skillName: "python", weight: 5, requiredProficiency: 4 },
        { skillName: "sql", weight: 3, requiredProficiency: 3 },
        { skillName: "node.js", weight: 4, requiredProficiency: 3 },
      ],
    },
    {
      recruiterId: recruiter1.recruiterProfile.id,
      type: "INTERNSHIP",
      title: "Frontend Developer Intern",
      description:
        "Design beautiful UIs with React. TypeScript knowledge preferred.",
      stipend: 1200,
      duration: "3 months",
      deadline: new Date("2026-06-15"),
      location: "Remote",
      remote: true,
      skills: [
        { skillName: "react", weight: 5, requiredProficiency: 4 },
        { skillName: "javascript", weight: 4, requiredProficiency: 3 },
        { skillName: "css", weight: 2, requiredProficiency: 2 },
      ],
    },
    {
      recruiterId: recruiter2.recruiterProfile.id,
      type: "PROJECT",
      title: "ML Pipeline for Sentiment Analysis",
      description:
        "Build an NLP pipeline using Python, scikit-learn, and deploy with FastAPI.",
      stipend: 2000,
      duration: "2 months",
      deadline: new Date("2026-05-15"),
      location: "New York, NY",
      remote: false,
      skills: [
        { skillName: "python", weight: 5, requiredProficiency: 5 },
        { skillName: "machine learning", weight: 5, requiredProficiency: 4 },
        { skillName: "rest apis", weight: 3, requiredProficiency: 3 },
      ],
    },
    {
      recruiterId: recruiter2.recruiterProfile.id,
      type: "INTERNSHIP",
      title: "Full Stack Developer Intern",
      description:
        "Work on both frontend (React) and backend (Node.js) with PostgreSQL.",
      stipend: 1800,
      duration: "6 months",
      deadline: new Date("2026-07-01"),
      location: "Austin, TX",
      remote: true,
      skills: [
        { skillName: "react", weight: 4, requiredProficiency: 3 },
        { skillName: "node.js", weight: 4, requiredProficiency: 4 },
        { skillName: "postgresql", weight: 3, requiredProficiency: 3 },
        { skillName: "git", weight: 1, requiredProficiency: 2 },
      ],
    },
    {
      recruiterId: recruiter1.recruiterProfile.id,
      type: "PROJECT",
      title: "DevOps Automation Project",
      description:
        "Containerize microservices and set up CI/CD pipelines using Docker and GitHub Actions.",
      stipend: null,
      duration: "1 month",
      deadline: new Date("2026-05-01"),
      location: "Remote",
      remote: true,
      skills: [
        { skillName: "docker", weight: 5, requiredProficiency: 4 },
        { skillName: "git", weight: 3, requiredProficiency: 3 },
        { skillName: "python", weight: 2, requiredProficiency: 2 },
      ],
    },
  ];

  for (const p of postings) {
    const { skills, ...postingData } = p;
    await prisma.posting.create({
      data: { ...postingData, postingSkills: { create: skills } },
    });
  }

  const candidate1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash,
      role: "CANDIDATE",
      candidateProfile: {
        create: {
          name: "Alice Johnson",
          phone: "+1-555-0101",
          location: "San Francisco, CA",
          linkedinUrl: "https://linkedin.com/in/alicejohnson",
          onboarded: true,
        },
      },
    },
    include: { candidateProfile: true },
  });

  await prisma.skill.createMany({
    data: [
      {
        candidateId: candidate1.candidateProfile.id,
        skillName: "python",
        proficiency: 4,
      },
      {
        candidateId: candidate1.candidateProfile.id,
        skillName: "flask",
        proficiency: 3,
      },
      {
        candidateId: candidate1.candidateProfile.id,
        skillName: "sql",
        proficiency: 3,
      },
      {
        candidateId: candidate1.candidateProfile.id,
        skillName: "react",
        proficiency: 2,
      },
      {
        candidateId: candidate1.candidateProfile.id,
        skillName: "git",
        proficiency: 4,
      },
    ],
  });

  const candidate2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash,
      role: "CANDIDATE",
      candidateProfile: {
        create: {
          name: "Bob Smith",
          phone: "+1-555-0102",
          location: "New York, NY",
          onboarded: true,
        },
      },
    },
    include: { candidateProfile: true },
  });

  await prisma.skill.createMany({
    data: [
      {
        candidateId: candidate2.candidateProfile.id,
        skillName: "react",
        proficiency: 5,
      },
      {
        candidateId: candidate2.candidateProfile.id,
        skillName: "javascript",
        proficiency: 5,
      },
      {
        candidateId: candidate2.candidateProfile.id,
        skillName: "typescript",
        proficiency: 4,
      },
      {
        candidateId: candidate2.candidateProfile.id,
        skillName: "node.js",
        proficiency: 4,
      },
      {
        candidateId: candidate2.candidateProfile.id,
        skillName: "css",
        proficiency: 4,
      },
      {
        candidateId: candidate2.candidateProfile.id,
        skillName: "postgresql",
        proficiency: 3,
      },
    ],
  });

  const candidate3 = await prisma.user.create({
    data: {
      email: "carol@example.com",
      passwordHash,
      role: "CANDIDATE",
      candidateProfile: {
        create: {
          name: "Carol Williams",
          phone: "+1-555-0103",
          location: "Austin, TX",
          onboarded: true,
        },
      },
    },
    include: { candidateProfile: true },
  });

  await prisma.skill.createMany({
    data: [
      {
        candidateId: candidate3.candidateProfile.id,
        skillName: "python",
        proficiency: 5,
      },
      {
        candidateId: candidate3.candidateProfile.id,
        skillName: "tensorflow",
        proficiency: 4,
      },
      {
        candidateId: candidate3.candidateProfile.id,
        skillName: "scikit-learn",
        proficiency: 4,
      },
      {
        candidateId: candidate3.candidateProfile.id,
        skillName: "docker",
        proficiency: 3,
      },
      {
        candidateId: candidate3.candidateProfile.id,
        skillName: "fastapi",
        proficiency: 4,
      },
    ],
  });

  console.log("✅ Seed data created successfully!");
  console.log(
    "   Recruiters: recruiter1@techcorp.com, recruiter2@startupai.com",
  );
  console.log(
    "   Candidates: alice@example.com, bob@example.com, carol@example.com",
  );
  console.log("   Password for all: password123");
  console.log("   Postings: 5 total (3 internships, 2 projects)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
