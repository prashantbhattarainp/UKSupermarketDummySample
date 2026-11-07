import mongoose from "mongoose";

import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Promotion } from "../models/Promotion.js";
import {
  convertMinorUnitsToPrice,
  convertPriceToMinorUnits,
} from "./catalogueService.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern = /^(?:https?:\/\/|\/)[^\s]+$/i;
const allowedFields = new Set([
  "title",
  "slug",
  "description",
  "productId",
  "categoryId",
  "image",
  "discountType",
  "discountValue",
  "promotionalPrice",
  "startDate",
  "endDate",
  "active",
]);

function promotionError(code, message, statusCode = 400, fieldErrors = {}) {
  return Object.assign(new Error(message), { code, statusCode, fieldErrors });
}

function requireObjectId(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  if (!mongoose.isValidObjectId(value)) {
    throw promotionError(
      "INVALID_IDENTIFIER",
      `${fieldName} must be a valid identifier.`,
      400,
      { [fieldName]: "Enter a valid identifier." },
    );
  }
  return value;
}

function validateString(value, fieldName, max, required = true) {
  if (value === undefined || value === null) {
    if (required)
      throw promotionError("INVALID_INPUT", `${fieldName} is required.`, 400, {
        [fieldName]: `${fieldName} is required.`,
      });
    return "";
  }
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.trim().length > max
  ) {
    throw promotionError("INVALID_INPUT", `${fieldName} is invalid.`, 400, {
      [fieldName]: `${fieldName} is invalid.`,
    });
  }
  return value.trim();
}

function validateSlug(value) {
  const slug = validateString(value, "slug", 120);
  if (!slugPattern.test(slug))
    throw promotionError(
      "INVALID_SLUG",
      "Slug must use lowercase kebab-case.",
      400,
      { slug: "Use lowercase letters, numbers, and hyphens." },
    );
  return slug;
}

function dateOnly(value, fieldName, endOfDay = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw promotionError(
      "INVALID_DATE",
      `${fieldName} must use YYYY-MM-DD format.`,
      400,
      { [fieldName]: "Use YYYY-MM-DD format." },
    );
  }
  const parsed = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`,
  );
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw promotionError(
      "INVALID_DATE",
      `${fieldName} is not a valid date.`,
      400,
      { [fieldName]: "Enter a valid calendar date." },
    );
  }
  return parsed;
}

function dateOutput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function validateBoolean(value) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean")
    throw promotionError("INVALID_INPUT", "Active must be a boolean.", 400, {
      active: "Active must be a boolean.",
    });
  return value;
}

function promotionInput(body = {}, partial = false) {
  const unknown = Object.keys(body).filter((key) => !allowedFields.has(key));
  if (unknown.length)
    throw promotionError(
      "INVALID_INPUT",
      "Unexpected promotion fields are not allowed.",
      400,
      { fields: "Remove unsupported fields." },
    );
  const input = {};
  if (!partial || body.title !== undefined)
    input.title = validateString(body.title, "title", 160);
  if (!partial || body.slug !== undefined) input.slug = validateSlug(body.slug);
  if (!partial || body.description !== undefined)
    input.description = validateString(body.description, "description", 2000);
  if (body.productId !== undefined || !partial)
    input.product = requireObjectId(body.productId, "productId");
  if (body.categoryId !== undefined)
    input.category = requireObjectId(body.categoryId, "categoryId");
  if (body.image !== undefined) {
    input.image = validateString(body.image, "image", 500, false);
    if (input.image && !imagePattern.test(input.image))
      throw promotionError(
        "INVALID_IMAGE",
        "Image must be an http(s) URL or site-relative path.",
        400,
        { image: "Enter a valid image URL." },
      );
  }
  if (!partial || body.discountType !== undefined) {
    if (!["percentage", "fixed_price"].includes(body.discountType))
      throw promotionError(
        "INVALID_DISCOUNT_TYPE",
        "Discount type must be percentage or fixed_price.",
        400,
        { discountType: "Choose a supported discount type." },
      );
    input.discountType = body.discountType;
  }
  const discountType = input.discountType || body.discountType;
  if (discountType === "percentage") {
    if (body.discountValue === undefined && !partial)
      throw promotionError(
        "INVALID_DISCOUNT",
        "Percentage discount value is required.",
        400,
        { discountValue: "Enter a percentage greater than zero." },
      );
    if (body.discountValue !== undefined) {
      const value = Number(body.discountValue);
      if (!Number.isFinite(value) || value <= 0 || value > 100)
        throw promotionError(
          "INVALID_DISCOUNT",
          "Percentage discount must be greater than 0 and no greater than 100.",
          400,
          { discountValue: "Enter a percentage from 0.01 to 100." },
        );
      input.discountValue = value;
    }
    if (!partial || body.discountType !== undefined)
      input.promotionalPriceMinor = null;
  } else if (discountType === "fixed_price") {
    if (body.promotionalPrice === undefined && !partial)
      throw promotionError(
        "INVALID_DISCOUNT",
        "A promotional price is required.",
        400,
        { promotionalPrice: "Enter a positive GBP price." },
      );
    if (body.promotionalPrice !== undefined) {
      if (
        !/^\d+(\.\d{1,2})?$/.test(String(body.promotionalPrice)) ||
        Number(body.promotionalPrice) <= 0
      )
        throw promotionError(
          "INVALID_DISCOUNT",
          "Promotional price must be a positive GBP amount.",
          400,
          { promotionalPrice: "Enter a positive price such as 1.50." },
        );
      input.promotionalPriceMinor = convertPriceToMinorUnits(
        body.promotionalPrice,
      );
    }
    if (!partial || body.discountType !== undefined) input.discountValue = null;
  }
  if (!partial || body.startDate !== undefined)
    input.startDate = dateOnly(body.startDate, "startDate");
  if (!partial || body.endDate !== undefined)
    input.endDate = dateOnly(body.endDate, "endDate", true);
  const start =
    input.startDate ||
    (body.startDate ? dateOnly(body.startDate, "startDate") : null);
  const end =
    input.endDate ||
    (body.endDate ? dateOnly(body.endDate, "endDate", true) : null);
  if (start && end && end <= start)
    throw promotionError(
      "INVALID_DATE_RANGE",
      "End date must be after start date.",
      400,
      { endDate: "End date must be after start date." },
    );
  if (body.active !== undefined) input.active = validateBoolean(body.active);
  return input;
}

function duplicateError(error) {
  if (error?.code === 11000)
    throw promotionError(
      "DUPLICATE_SLUG",
      "A promotion with that slug already exists.",
      409,
      { slug: "That slug is already in use." },
    );
  throw error;
}

function payload(promotion) {
  const product =
    promotion.product && typeof promotion.product === "object"
      ? promotion.product
      : null;
  const category =
    promotion.category && typeof promotion.category === "object"
      ? promotion.category
      : null;
  return {
    id: promotion._id?.toString() || promotion.id,
    title: promotion.title,
    slug: promotion.slug,
    description: promotion.description,
    product: product
      ? {
          id: product._id?.toString() || product.id,
          slug: product.slug,
          name: product.name,
          price: convertMinorUnitsToPrice(product.priceMinor),
          unit: product.unit,
          active: product.active,
        }
      : null,
    productId:
      product?._id?.toString() ||
      product?.id ||
      promotion.product?.toString() ||
      null,
    category: category
      ? {
          id: category._id?.toString() || category.id,
          slug: category.slug,
          name: category.name,
          active: category.active,
        }
      : null,
    categoryId:
      category?._id?.toString() ||
      category?.id ||
      promotion.category?.toString() ||
      null,
    image: promotion.image || "",
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    promotionalPriceMinor: promotion.promotionalPriceMinor,
    promotionalPrice:
      promotion.promotionalPriceMinor === null ||
      promotion.promotionalPriceMinor === undefined
        ? null
        : convertMinorUnitsToPrice(promotion.promotionalPriceMinor),
    startDate: dateOutput(promotion.startDate),
    endDate: dateOutput(promotion.endDate),
    active: promotion.active,
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
  };
}

const populateFields = [
  { path: "product", select: "name slug priceMinor unit active" },
  { path: "category", select: "name slug active" },
];

export function createPromotionService({
  PromotionModel = Promotion,
  ProductModel = Product,
  CategoryModel = Category,
} = {}) {
  async function ensureReferences(input, { requireActive = false } = {}) {
    if (input.product) {
      const product =
        (await ProductModel.findById(input.product).lean?.()) ||
        (await ProductModel.findById(input.product));
      if (!product)
        throw promotionError("PRODUCT_NOT_FOUND", "Product not found.", 404, {
          productId: "Choose an existing product.",
        });
      if (requireActive && !product.active)
        throw promotionError(
          "PRODUCT_INACTIVE",
          "Active promotions must reference an active product.",
          409,
          { productId: "Choose an active product." },
        );
    }
    if (input.category) {
      const category =
        (await CategoryModel.findById(input.category).lean?.()) ||
        (await CategoryModel.findById(input.category));
      if (!category)
        throw promotionError("CATEGORY_NOT_FOUND", "Category not found.", 404, {
          categoryId: "Choose an existing category.",
        });
    }
  }

  async function listOwner({ search = "", active, page = 1, limit = 12 } = {}) {
    const safePage = Number(page);
    const safeLimit = Number(limit);
    if (
      !Number.isInteger(safePage) ||
      safePage < 1 ||
      !Number.isInteger(safeLimit) ||
      safeLimit < 1 ||
      safeLimit > 50
    )
      throw promotionError(
        "INVALID_QUERY",
        "Page and limit must be valid positive integers.",
      );
    const query = {};
    if (search.trim())
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { slug: { $regex: search.trim(), $options: "i" } },
      ];
    if (active !== undefined) {
      if (!["true", "false"].includes(active))
        throw promotionError("INVALID_QUERY", "Active must be true or false.");
      query.active = active === "true";
    }
    const total = await PromotionModel.countDocuments(query);
    const records = await PromotionModel.find(query)
      .populate(populateFields)
      .sort({ startDate: -1, title: 1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();
    return {
      items: records.map(payload),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: total ? Math.ceil(total / safeLimit) : 0,
      },
    };
  }

  async function getOwner(id) {
    if (!mongoose.isValidObjectId(id))
      throw promotionError(
        "INVALID_IDENTIFIER",
        "id must be a valid identifier.",
      );
    const record = await PromotionModel.findById(id)
      .populate(populateFields)
      .lean();
    if (!record)
      throw promotionError("PROMOTION_NOT_FOUND", "Promotion not found.", 404);
    return payload(record);
  }

  async function create(body) {
    const input = promotionInput(body);
    await ensureReferences(input, { requireActive: input.active !== false });
    try {
      return payload(await PromotionModel.create(input));
    } catch (error) {
      duplicateError(error);
    }
  }

  async function update(id, body) {
    if (!mongoose.isValidObjectId(id))
      throw promotionError(
        "INVALID_IDENTIFIER",
        "id must be a valid identifier.",
      );
    const current = await PromotionModel.findById(id).lean();
    if (!current)
      throw promotionError("PROMOTION_NOT_FOUND", "Promotion not found.", 404);
    const input = promotionInput({
      title: current.title,
      slug: current.slug,
      description: current.description,
      productId: current.product,
      categoryId: current.category,
      image: current.image,
      discountType: current.discountType,
      discountValue: current.discountValue,
      promotionalPrice:
        current.promotionalPriceMinor === null ||
        current.promotionalPriceMinor === undefined
          ? undefined
          : convertMinorUnitsToPrice(current.promotionalPriceMinor),
      startDate: dateOutput(current.startDate),
      endDate: dateOutput(current.endDate),
      active: current.active,
      ...body,
    });
    await ensureReferences(input, { requireActive: input.active !== false });
    try {
      return payload(
        await PromotionModel.findByIdAndUpdate(id, input, {
          new: true,
          runValidators: true,
        })
          .populate(populateFields)
          .lean(),
      );
    } catch (error) {
      duplicateError(error);
    }
  }

  async function deactivate(id) {
    if (!mongoose.isValidObjectId(id))
      throw promotionError(
        "INVALID_IDENTIFIER",
        "id must be a valid identifier.",
      );
    const record = await PromotionModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    )
      .populate(populateFields)
      .lean();
    if (!record)
      throw promotionError("PROMOTION_NOT_FOUND", "Promotion not found.", 404);
    return payload(record);
  }

  async function listPublic(now = new Date()) {
    const records = await PromotionModel.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate(populateFields)
      .sort({ startDate: -1, title: 1 })
      .lean();
    return records
      .filter(
        (record) =>
          (!record.product || record.product.active) &&
          (!record.category || record.category.active),
      )
      .map(payload);
  }

  return { listOwner, getOwner, create, update, deactivate, listPublic };
}
