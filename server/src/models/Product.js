import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required."],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Product slug must be lowercase kebab-case.",
      ],
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required."],
      index: true,
    },
    priceMinor: {
      type: Number,
      required: [true, "Product priceMinor is required."],
      min: [0, "Product priceMinor must be a non-negative integer."],
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message:
          "Product priceMinor must be a valid non-negative integer minor unit.",
      },
    },
    unit: {
      type: String,
      required: [true, "Product unit is required."],
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "GBP",
      enum: ["GBP"],
    },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model("Product", productSchema);
export default Product;
