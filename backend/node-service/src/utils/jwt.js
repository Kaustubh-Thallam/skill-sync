const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. Cannot start.",
  );
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const JWT_OPTIONS = {
  issuer: "skillsync-api",
  audience: "skillsync-client",
};

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...JWT_OPTIONS,
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, JWT_OPTIONS);
}

module.exports = { signToken, verifyToken };
