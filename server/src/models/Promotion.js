import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Promotion title is required."],
      trim: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: [true, "Promotion slug is required."],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Promotion slug must be lowercase kebab-case.",
      ],
    },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: { type: String, trim: true, default: "" },
    discountType: {
      type: String,
      enum: ["percentage", "fixed_price"],
      required: true,
    },
    discountValue: { type: Number, default: null },
    promotionalPriceMinor: { type: Number, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

promotionSchema.index({ active: 1, startDate: 1, endDate: 1 });

promotionSchema.path("endDate").validate(function validateDateRange(value) {
  return !this.startDate || value > this.startDate;
}, "Promotion end date must be after its start date.");

export const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
