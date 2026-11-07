import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be valid."],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
      select: false,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required."],
      trim: true,
      maxlength: 120,
    },
    role: { type: String, enum: ["owner", "staff"], default: "owner" },
    active: { type: Boolean, default: true },
    lastSuccessfulLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
export default User;
