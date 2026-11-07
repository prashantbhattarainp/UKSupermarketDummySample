import mongoose from "mongoose";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const weeklyHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: true,
    },
    closed: { type: Boolean, default: false },
    openTime: { type: String, default: "08:00", match: timePattern },
    closeTime: { type: String, default: "18:00", match: timePattern },
  },
  { _id: false },
);

const exceptionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    closed: { type: Boolean, default: true },
    openTime: {
      type: String,
      default: "",
      match: /^$|^([01]\d|2[0-3]):[0-5]\d$/,
    },
    closeTime: {
      type: String,
      default: "",
      match: /^$|^([01]\d|2[0-3]):[0-5]\d$/,
    },
    note: { type: String, trim: true, maxlength: 240, default: "" },
  },
  { _id: false },
);

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    descriptor: { type: String, trim: true, maxlength: 160, default: "" },
    strapline: { type: String, trim: true, maxlength: 240, default: "" },
    about: { type: String, trim: true, maxlength: 4000, default: "" },
    addressLines: { type: [String], default: [] },
    postcode: { type: String, trim: true, maxlength: 20, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 160,
      default: "",
    },
    directionsUrl: { type: String, trim: true, maxlength: 500, default: "" },
    accessibility: { type: String, trim: true, maxlength: 1000, default: "" },
    published: { type: Boolean, default: true },
    openingHours: { type: [weeklyHourSchema], default: [] },
    exceptions: { type: [exceptionSchema], default: [] },
  },
  { timestamps: true },
);

storeSettingsSchema
  .path("exceptions")
  .validate(
    (items) => new Set(items.map((item) => item.date)).size === items.length,
    "Exception dates must be unique.",
  );

export const StoreSettings = mongoose.model(
  "StoreSettings",
  storeSettingsSchema,
);
export default StoreSettings;
