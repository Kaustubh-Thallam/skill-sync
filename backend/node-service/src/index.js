const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const rateLimit = require("./middleware/rateLimit");

dotenv.config();

const app = express();

// ─── Security ───
app.set("trust proxy", 1); // Trust Render/Vercel proxy for correct client IP
app.use(helmet());         // Security headers (HSTS, X-Content-Type, X-Frame-Options, etc.)

// ─── Global Rate Limiter ───
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP. Please try again later.",
  }),
);

// ─── Core Middleware ───
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// ─── Health Check ───
const healthHandler = (req, res) => {
  res.json({
    status: "ok",
    service: "skillsync-node",
    timestamp: new Date().toISOString(),
  });
};
app.get("/health", healthHandler);
app.head("/health", healthHandler);

// ─── Route Imports ───
const authRoutes = require("./routes/auth");
const candidateRoutes = require("./routes/candidates");
const recruiterRoutes = require("./routes/recruiters");
const postingRoutes = require("./routes/postings");
const scoreRoutes = require("./routes/scores");
const applicationRoutes = require("./routes/applications");
const rankingRoutes = require("./routes/rankings");
const notificationRoutes = require("./routes/notifications");
const recommendationRoutes = require("./routes/recommendations");
const adminRoutes = require("./routes/admin");

// ─── Route Registration ───
app.use("/auth", authRoutes);
app.use("/candidates", candidateRoutes);
app.use("/recruiters", recruiterRoutes);
app.use("/postings", postingRoutes);
app.use("/scores", scoreRoutes);
app.use("/applications", applicationRoutes);
app.use("/rankings", rankingRoutes);
app.use("/notifications", notificationRoutes);
app.use("/candidates/recommendations", recommendationRoutes);
app.use("/admin", adminRoutes);

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  if (err.name === "ZodError") {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      error: "Validation failed",
      details: issues.map((e) => ({
        field: (e.path || []).join("."),
        message: e.message,
      })),
    });
  }
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "A record with this data already exists.",
      field: err.meta?.target,
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Maximum size is 5MB." });
  }

  console.error(
    `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`,
    err.message,
  );
  if (process.env.NODE_ENV === "development") console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ─── Start Server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[NODE] SkillSync API running on port ${PORT}`);
  console.log(`[NODE] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `[NODE] Python service: ${process.env.PYTHON_SERVICE_URL || "http://localhost:8000"}`,
  );
});

module.exports = app;
