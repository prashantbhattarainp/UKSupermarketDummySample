import crypto from "node:crypto";
import "dotenv/config";

const allowedNodeEnvironments = new Set(["development", "test", "production"]);

export function validateEnvironment(env = process.env) {
  const issues = [];
  const normalized = {
    NODE_ENV: env.NODE_ENV ?? "development",
    PORT: Number(env.PORT ?? 5000),
    CLIENT_ORIGIN: env.CLIENT_ORIGIN ?? "http://localhost:5173",
    MONGODB_URI: env.MONGODB_URI ?? "",
    SESSION_SECRET:
      env.SESSION_SECRET ??
      (env.NODE_ENV === "production"
        ? ""
        : crypto.randomBytes(32).toString("hex")),
    SESSION_COOKIE_NAME: env.SESSION_COOKIE_NAME ?? "deepak.sid",
    SESSION_TTL_MS: Number(env.SESSION_TTL_MS ?? 8 * 60 * 60 * 1000),
  };

  if (!allowedNodeEnvironments.has(normalized.NODE_ENV)) {
    issues.push("NODE_ENV must be one of: development, test, or production.");
  }

  if (
    !Number.isInteger(normalized.PORT) ||
    normalized.PORT < 1 ||
    normalized.PORT > 65535
  ) {
    issues.push("PORT must be a valid integer between 1 and 65535.");
  }

  if (
    !normalized.CLIENT_ORIGIN ||
    !/^https?:\/\//i.test(normalized.CLIENT_ORIGIN)
  ) {
    issues.push("CLIENT_ORIGIN must be a valid http:// or https:// URL.");
  }

  if (normalized.NODE_ENV === "production" && !normalized.MONGODB_URI) {
    issues.push("MONGODB_URI is required in production.");
  }

  if (!normalized.SESSION_SECRET || normalized.SESSION_SECRET.length < 32) {
    issues.push("SESSION_SECRET must be at least 32 characters.");
  }

  if (
    !Number.isInteger(normalized.SESSION_TTL_MS) ||
    normalized.SESSION_TTL_MS < 15 * 60 * 1000
  ) {
    issues.push("SESSION_TTL_MS must be at least 15 minutes.");
  }

  if (
    normalized.NODE_ENV === "production" &&
    !/^https:\/\//i.test(normalized.CLIENT_ORIGIN)
  ) {
    issues.push("CLIENT_ORIGIN must use https:// in production.");
  }

  if (issues.length > 0) {
    throw new Error(`Invalid configuration: ${issues.join(" ")}`);
  }

  return normalized;
}

export const env = validateEnvironment(process.env);
