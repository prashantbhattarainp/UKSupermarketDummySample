import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewerName: { type: String, required: true, trim: true, maxlength: 100 },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },
    title: { type: String, trim: true, maxlength: 160, default: "" },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

export const Review = mongoose.model("Review", reviewSchema);
export default Review;
