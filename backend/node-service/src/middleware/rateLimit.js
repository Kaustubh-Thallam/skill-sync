/**
 * Simple in-memory rate limiter (zero dependencies).
 *
 * @param {Object} options
 * @param {number} options.windowMs – Time window in milliseconds (default 15 min)
 * @param {number} options.max       – Max requests per window per IP (default 20)
 * @param {string} options.message   – Error message sent when rate-limited
 */
function rateLimit({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = "Too many requests, please try again later.",
} = {}) {
  const hits = new Map(); // IP → { count, resetAt }

  // Clean up expired entries every 5 minutes
  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, entry] of hits) {
        if (now > entry.resetAt) hits.delete(ip);
      }
    },
    5 * 60 * 1000,
  ).unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    let entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      hits.set(ip, entry);
    } else {
      entry.count++;
    }

    // Set informational headers
    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      console.warn(
        `[SECURITY] Rate limit exceeded: ${ip} on ${req.method} ${req.path}`,
      );
      return res.status(429).json({ error: message });
    }

    next();
  };
}

module.exports = rateLimit;
