import bcrypt from "bcryptjs";

import { User } from "../models/User.js";

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validateLoginInput({ email, password } = {}) {
  const normalizedEmail = normalizeEmail(email);
  const fieldErrors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (typeof password !== "string" || password.length < 1) {
    fieldErrors.password = "Enter your password.";
  }

  return { normalizedEmail, fieldErrors };
}

export function toPublicUser(user) {
  return {
    id: user.id || user._id?.toString(),
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

export function createAuthService({ userModel = User } = {}) {
  return {
    async authenticate(email, password) {
      const user = await userModel.findOne({ email }).select("+passwordHash");
      const passwordHash =
        user?.passwordHash ||
        "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid";
      const passwordMatches = await bcrypt.compare(password, passwordHash);

      if (!user || !passwordMatches || !user.active || user.role !== "owner") {
        return null;
      }

      user.lastSuccessfulLogin = new Date();
      await user.save();
      return user;
    },
    async findById(id) {
      if (!id) return null;
      return userModel.findById(id);
    },
  };
}

export { GENERIC_LOGIN_ERROR };
