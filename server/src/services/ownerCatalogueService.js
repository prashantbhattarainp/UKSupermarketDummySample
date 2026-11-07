import mongoose from "mongoose";

import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import {
  convertMinorUnitsToPrice,
  convertPriceToMinorUnits,
} from "./catalogueService.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern = /^(?:https?:\/\/|\/)[^\s]+$/i;

function serviceError(code, message, statusCode = 400, fieldErrors = {}) {
  return Object.assign(new Error(message), {
    code,
    statusCode,
    fieldErrors,
  });
}

function requireObjectId(value, fieldName) {
  if (!mongoose.isValidObjectId(value)) {
    throw serviceError(
      "INVALID_IDENTIFIER",
      `${fieldName} must be a valid identifier.`,
      400,
      {
        [fieldName]: `${fieldName} must be a valid identifier.`,
      },
    );
  }
  return value;
}

function validateString(
  value,
  fieldName,
  { required = false, max = 500 } = {},
) {
  if (value === undefined) {
    if (required)
      throw serviceError("INVALID_INPUT", `${fieldName} is required.`, 400, {
        [fieldName]: `${fieldName} is required.`,
      });
    return undefined;
  }
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.trim().length > max
  ) {
    throw serviceError("INVALID_INPUT", `${fieldName} is invalid.`, 400, {
      [fieldName]: `${fieldName} is invalid.`,
    });
  }
  return value.trim();
}

function validateSlug(value, fieldName = "slug") {
  const slug = validateString(value, fieldName, { required: true, max: 120 });
  if (!slugPattern.test(slug)) {
    throw serviceError(
      "INVALID_SLUG",
      "Slug must use lowercase kebab-case.",
      400,
      { [fieldName]: "Use lowercase letters, numbers, and hyphens." },
    );
  }
  return slug;
}

function validateBoolean(value, fieldName) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw serviceError(
      "INVALID_INPUT",
      `${fieldName} must be a boolean.`,
      400,
      { [fieldName]: `${fieldName} must be a boolean.` },
    );
  }
  return value;
}

function validateDisplayOrder(value) {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw serviceError(
      "INVALID_INPUT",
      "Display order must be a non-negative integer.",
      400,
      { displayOrder: "Display order must be a non-negative integer." },
    );
  }
  return value;
}

function validatePrice(value) {
  if (value === undefined) return undefined;
  if (typeof value !== "number" && typeof value !== "string") {
    throw serviceError("INVALID_PRICE", "Price must be a GBP amount.", 400, {
      price: "Price must be a GBP amount.",
    });
  }
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text) || Number(text) < 0) {
    throw serviceError(
      "INVALID_PRICE",
      "Price must be a valid non-negative GBP amount.",
      400,
      { price: "Enter a price such as 1.50." },
    );
  }
  return convertPriceToMinorUnits(text);
}

function validateImage(value) {
  if (value === undefined) return undefined;
  const image = validateString(value, "image", { max: 500 });
  if (image && !imagePattern.test(image)) {
    throw serviceError(
      "INVALID_IMAGE",
      "Image must be an http(s) URL or site-relative path.",
      400,
      { image: "Enter a valid image URL." },
    );
  }
  return image;
}

function productPayload(product) {
  const category =
    product.category && typeof product.category === "object"
      ? product.category
      : null;
  return {
    id: product._id?.toString() || product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: category ? categoryPayload(category) : null,
    categoryId:
      category?._id?.toString() || category?.id || product.category?.toString(),
    priceMinor: product.priceMinor,
    price: convertMinorUnitsToPrice(product.priceMinor),
    unit: product.unit,
    image: product.image || "",
    active: product.active,
    featured: product.featured ?? false,
    displayOrder: product.displayOrder ?? 0,
    currency: product.currency || "GBP",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function categoryPayload(category) {
  return {
    id: category._id?.toString() || category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    active: category.active,
    displayOrder: category.displayOrder ?? 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function handleDuplicate(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "slug";
    throw serviceError(
      "DUPLICATE_SLUG",
      `A record with that ${field} already exists.`,
      409,
      { [field]: `That ${field} is already in use.` },
    );
  }
  throw error;
}

export function createOwnerCatalogueService({
  CategoryModel = Category,
  ProductModel = Product,
} = {}) {
  async function findCategory(categoryId) {
    requireObjectId(categoryId, "categoryId");
    const category = await CategoryModel.findById(categoryId);
    if (!category)
      throw serviceError("CATEGORY_NOT_FOUND", "Category not found.", 404);
    return category;
  }

  function productInput(body = {}, partial = false) {
    const allowed = new Set([
      "name",
      "slug",
      "description",
      "categoryId",
      "price",
      "unit",
      "image",
      "active",
      "featured",
      "displayOrder",
    ]);
    const unknown = Object.keys(body).filter((key) => !allowed.has(key));
    if (unknown.length)
      throw serviceError(
        "INVALID_INPUT",
        "Unexpected product fields are not allowed.",
        400,
        { fields: "Remove unsupported fields." },
      );
    const input = {};
    if (!partial || body.name !== undefined)
      input.name = validateString(body.name, "name", {
        required: true,
        max: 160,
      });
    if (!partial || body.slug !== undefined)
      input.slug = validateSlug(body.slug);
    if (!partial || body.description !== undefined)
      input.description = validateString(body.description, "description", {
        required: true,
        max: 2000,
      });
    if (!partial || body.categoryId !== undefined)
      input.category = requireObjectId(body.categoryId, "categoryId");
    if (!partial || body.price !== undefined)
      input.priceMinor = validatePrice(body.price);
    if (!partial || body.unit !== undefined)
      input.unit = validateString(body.unit, "unit", {
        required: true,
        max: 100,
      });
    if (body.image !== undefined) input.image = validateImage(body.image);
    if (body.active !== undefined)
      input.active = validateBoolean(body.active, "active");
    if (body.featured !== undefined)
      input.featured = validateBoolean(body.featured, "featured");
    if (body.displayOrder !== undefined)
      input.displayOrder = validateDisplayOrder(body.displayOrder);
    return input;
  }

  function categoryInput(body = {}, partial = false) {
    const allowed = new Set([
      "name",
      "slug",
      "description",
      "active",
      "displayOrder",
    ]);
    const unknown = Object.keys(body).filter((key) => !allowed.has(key));
    if (unknown.length)
      throw serviceError(
        "INVALID_INPUT",
        "Unexpected category fields are not allowed.",
        400,
        { fields: "Remove unsupported fields." },
      );
    const input = {};
    if (!partial || body.name !== undefined)
      input.name = validateString(body.name, "name", {
        required: true,
        max: 160,
      });
    if (!partial || body.slug !== undefined)
      input.slug = validateSlug(body.slug);
    if (body.description !== undefined || !partial)
      input.description = validateString(
        body.description ?? "",
        "description",
        { max: 1000 },
      );
    if (body.active !== undefined)
      input.active = validateBoolean(body.active, "active");
    if (body.displayOrder !== undefined)
      input.displayOrder = validateDisplayOrder(body.displayOrder);
    return input;
  }

  async function listProducts({
    search = "",
    categoryId = "",
    active,
    page = 1,
    limit = 12,
  } = {}) {
    const safePage = Number(page);
    const safeLimit = Number(limit);
    if (
      !Number.isInteger(safePage) ||
      safePage < 1 ||
      !Number.isInteger(safeLimit) ||
      safeLimit < 1 ||
      safeLimit > 50
    )
      throw serviceError(
        "INVALID_QUERY",
        "Page and limit must be valid positive integers.",
      );
    const query = {};
    if (search.trim())
      query.name = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    if (categoryId) query.category = requireObjectId(categoryId, "categoryId");
    if (active !== undefined) {
      if (active !== "true" && active !== "false")
        throw serviceError("INVALID_QUERY", "Active must be true or false.");
      query.active = active === "true";
    }
    const total = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query)
      .populate("category", "name slug description active displayOrder")
      .sort({ displayOrder: 1, name: 1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean();
    return {
      items: products.map(productPayload),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: total ? Math.ceil(total / safeLimit) : 0,
      },
    };
  }

  async function getProduct(id) {
    requireObjectId(id, "id");
    const product = await ProductModel.findById(id)
      .populate("category", "name slug description active displayOrder")
      .lean();
    if (!product)
      throw serviceError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    return productPayload(product);
  }

  async function createProduct(body) {
    const input = productInput(body);
    await findCategory(input.category);
    try {
      return productPayload(await ProductModel.create(input));
    } catch (error) {
      handleDuplicate(error);
    }
  }

  async function updateProduct(id, body) {
    requireObjectId(id, "id");
    const input = productInput(body, true);
    if (input.category) await findCategory(input.category);
    try {
      const product = await ProductModel.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      })
        .populate("category", "name slug description active displayOrder")
        .lean();
      if (!product)
        throw serviceError("PRODUCT_NOT_FOUND", "Product not found.", 404);
      return productPayload(product);
    } catch (error) {
      handleDuplicate(error);
    }
  }

  async function deactivateProduct(id) {
    requireObjectId(id, "id");
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    )
      .populate("category", "name slug description active displayOrder")
      .lean();
    if (!product)
      throw serviceError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    return productPayload(product);
  }

  async function listCategories() {
    const categories = await CategoryModel.find({})
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return categories.map(categoryPayload);
  }

  async function getCategory(id) {
    requireObjectId(id, "id");
    const category = await CategoryModel.findById(id).lean();
    if (!category)
      throw serviceError("CATEGORY_NOT_FOUND", "Category not found.", 404);
    return categoryPayload(category);
  }

  async function createCategory(body) {
    const input = categoryInput(body);
    try {
      return categoryPayload(await CategoryModel.create(input));
    } catch (error) {
      handleDuplicate(error);
    }
  }

  async function updateCategory(id, body) {
    requireObjectId(id, "id");
    const input = categoryInput(body, true);
    if (input.active === false) {
      const productCount = await ProductModel.countDocuments({
        category: id,
      });
      if (productCount > 0)
        throw serviceError(
          "CATEGORY_IN_USE",
          "Deactivate or move its products before deactivating this category.",
          409,
        );
    }
    try {
      const category = await CategoryModel.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      }).lean();
      if (!category)
        throw serviceError("CATEGORY_NOT_FOUND", "Category not found.", 404);
      return categoryPayload(category);
    } catch (error) {
      handleDuplicate(error);
    }
  }

  async function deactivateCategory(id) {
    requireObjectId(id, "id");
    const productCount = await ProductModel.countDocuments({
      category: id,
    });
    if (productCount > 0)
      throw serviceError(
        "CATEGORY_IN_USE",
        "Deactivate or move its products before deactivating this category.",
        409,
      );
    const category = await CategoryModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    ).lean();
    if (!category)
      throw serviceError("CATEGORY_NOT_FOUND", "Category not found.", 404);
    return categoryPayload(category);
  }

  return {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deactivateProduct,
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deactivateCategory,
  };
}
