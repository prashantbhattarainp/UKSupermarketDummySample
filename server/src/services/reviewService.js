import mongoose from "mongoose";

import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";

const statuses = new Set(["pending", "approved", "rejected"]);

function reviewError(code, message, statusCode = 400, fieldErrors = {}) {
  return Object.assign(new Error(message), { code, statusCode, fieldErrors });
}
function reviewPayload(review, includeModeration = false) {
  const value = review?.toObject ? review.toObject() : review;
  const product =
    value?.product && typeof value.product === "object" ? value.product : null;
  return {
    id: value?._id?.toString() || value?.id,
    reviewerName: value?.reviewerName,
    product: product
      ? {
          id: product._id?.toString() || product.id,
          slug: product.slug,
          name: product.name,
        }
      : null,
    rating: value?.rating,
    title: value?.title || "",
    comment: value?.comment,
    createdAt: value?.createdAt,
    ...(includeModeration
      ? { status: value?.status, updatedAt: value?.updatedAt }
      : {}),
  };
}
function input(body = {}) {
  const allowed = new Set([
    "reviewerName",
    "productId",
    "rating",
    "title",
    "comment",
  ]);
  if (Object.keys(body).some((key) => !allowed.has(key)))
    throw reviewError(
      "INVALID_INPUT",
      "Unexpected review fields are not allowed.",
      400,
      { fields: "Remove unsupported fields." },
    );
  if (
    typeof body.reviewerName !== "string" ||
    !body.reviewerName.trim() ||
    body.reviewerName.trim().length > 100
  )
    throw reviewError(
      "INVALID_INPUT",
      "Reviewer name is required and must be 100 characters or fewer.",
      400,
      { reviewerName: "Enter a reviewer name." },
    );
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5)
    throw reviewError(
      "INVALID_RATING",
      "Rating must be an integer from 1 to 5.",
      400,
      { rating: "Choose a rating from 1 to 5." },
    );
  if (
    typeof body.comment !== "string" ||
    body.comment.trim().length < 10 ||
    body.comment.trim().length > 2000
  )
    throw reviewError(
      "INVALID_COMMENT",
      "Comment must be between 10 and 2000 characters.",
      400,
      { comment: "Enter between 10 and 2000 characters." },
    );
  if (body.productId !== undefined && !mongoose.isValidObjectId(body.productId))
    throw reviewError(
      "INVALID_IDENTIFIER",
      "productId must be a valid identifier.",
      400,
      { productId: "Choose a valid product." },
    );
  return {
    reviewerName: body.reviewerName.trim(),
    product: body.productId || null,
    rating: body.rating,
    title:
      typeof body.title === "string" ? body.title.trim().slice(0, 160) : "",
    comment: body.comment.trim(),
    status: "pending",
  };
}

export function createReviewService({
  ReviewModel = Review,
  ProductModel = Product,
} = {}) {
  async function verifyProduct(productId) {
    if (!productId) return;
    const product = await ProductModel.findById(productId).lean();
    if (!product)
      throw reviewError("PRODUCT_NOT_FOUND", "Product not found.", 404);
  }
  async function listPublic({ page = 1, limit = 12, productId } = {}) {
    const query = { status: "approved" };
    if (productId) {
      if (!mongoose.isValidObjectId(productId))
        throw reviewError(
          "INVALID_IDENTIFIER",
          "productId must be a valid identifier.",
        );
      query.product = productId;
    }
    const total = await ReviewModel.countDocuments(query);
    const records = await ReviewModel.find(query)
      .populate("product", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return {
      items: records.map((record) => reviewPayload(record)),
      pagination: {
        page,
        limit,
        total,
        totalPages: total ? Math.ceil(total / limit) : 0,
      },
    };
  }
  async function create(body) {
    const values = input(body);
    await verifyProduct(values.product);
    return reviewPayload(await ReviewModel.create(values));
  }
  async function listOwner({ status } = {}) {
    const query = status ? { status } : {};
    if (status && !statuses.has(status))
      throw reviewError("INVALID_STATUS", "Review status is not supported.");
    const records = await ReviewModel.find(query)
      .populate("product", "name slug")
      .sort({ createdAt: -1 })
      .lean();
    return records.map((record) => reviewPayload(record, true));
  }
  async function getOwner(id) {
    if (!mongoose.isValidObjectId(id))
      throw reviewError("INVALID_IDENTIFIER", "id must be a valid identifier.");
    const record = await ReviewModel.findById(id)
      .populate("product", "name slug")
      .lean();
    if (!record)
      throw reviewError("REVIEW_NOT_FOUND", "Review not found.", 404);
    return reviewPayload(record, true);
  }
  async function moderate(id, status) {
    if (!mongoose.isValidObjectId(id))
      throw reviewError("INVALID_IDENTIFIER", "id must be a valid identifier.");
    if (!statuses.has(status) || status === "pending")
      throw reviewError(
        "INVALID_STATUS",
        "Moderation status must be approved or rejected.",
      );
    const record = await ReviewModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    )
      .populate("product", "name slug")
      .lean();
    if (!record)
      throw reviewError("REVIEW_NOT_FOUND", "Review not found.", 404);
    return reviewPayload(record, true);
  }
  return { listPublic, create, listOwner, getOwner, moderate };
}
