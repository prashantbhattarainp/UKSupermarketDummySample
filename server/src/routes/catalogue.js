import { Router } from "express";

import { createCatalogueService } from "../services/catalogueService.js";
import { buildErrorResponse, buildSuccessResponse } from "../utils/response.js";

const VALID_SORTS = new Set([
  "featured",
  "name-asc",
  "price-asc",
  "price-desc",
]);

function createValidationError(code, message, fieldErrors = {}) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = code;
  error.fieldErrors = fieldErrors;
  return error;
}

function parseDecimalPrice(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const input = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(input)) {
    throw createValidationError(
      "INVALID_PRICE",
      `The ${fieldName} value must be a price such as 1.50.`,
      { [fieldName]: `The ${fieldName} value must be a valid price.` },
    );
  }

  const numericValue = Number(input);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw createValidationError(
      "INVALID_PRICE",
      `The ${fieldName} value must be zero or more.`,
      { [fieldName]: `The ${fieldName} value must be zero or more.` },
    );
  }

  return numericValue;
}

function parsePositiveInteger(value, fieldName, fallback) {
  const number = Number(value ?? fallback);

  if (!Number.isInteger(number) || number < 1) {
    throw createValidationError(
      "INVALID_QUERY",
      `The ${fieldName} value must be a positive integer.`,
      { [fieldName]: `The ${fieldName} value must be a positive integer.` },
    );
  }

  return number;
}

export function createCatalogueRouter({ catalogueService } = {}) {
  const router = Router();
  const service = catalogueService || createCatalogueService();

  router.get("/categories", async (request, response, next) => {
    try {
      const categories = await service.listCategories();
      response.json(
        buildSuccessResponse(categories, { count: categories.length }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/categories/:slug", async (request, response, next) => {
    try {
      const category = await service.getCategoryBySlug(request.params.slug);

      if (!category) {
        const error = new Error("Category not found.");
        error.statusCode = 404;
        error.code = "CATEGORY_NOT_FOUND";
        throw error;
      }

      response.json(buildSuccessResponse(category, { slug: category.slug }));
    } catch (error) {
      next(error);
    }
  });

  router.get("/products", async (request, response, next) => {
    try {
      const search =
        typeof request.query.search === "string" ? request.query.search : "";
      const category =
        typeof request.query.category === "string"
          ? request.query.category
          : "";
      const minPrice = parseDecimalPrice(request.query.minPrice, "minPrice");
      const maxPrice = parseDecimalPrice(request.query.maxPrice, "maxPrice");
      const sortValue =
        typeof request.query.sort === "string"
          ? request.query.sort
          : "featured";

      if (sortValue && !VALID_SORTS.has(sortValue)) {
        throw createValidationError(
          "INVALID_SORT",
          "Sort order is not supported.",
          { sort: "Sort order is not supported." },
        );
      }

      if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        throw createValidationError(
          "INVALID_PRICE_RANGE",
          "Minimum price cannot be greater than maximum price.",
          { minPrice: "Minimum price cannot be greater than maximum price." },
        );
      }

      const page = parsePositiveInteger(request.query.page ?? 1, "page", 1);
      const limit = parsePositiveInteger(
        request.query.limit ?? 12,
        "limit",
        12,
      );

      if (limit > 50) {
        throw createValidationError(
          "INVALID_LIMIT",
          "Limit cannot exceed 50.",
          {
            limit: "Limit cannot exceed 50.",
          },
        );
      }

      const result = await service.listProducts({
        search,
        categorySlug: category,
        minPrice: minPrice !== null ? minPrice.toString() : null,
        maxPrice: maxPrice !== null ? maxPrice.toString() : null,
        sort: sortValue,
        page,
        limit,
      });

      response.json(
        buildSuccessResponse(
          {
            items: result.items,
            pagination: result.pagination,
          },
          {
            pagination: result.pagination,
            filters: {
              search,
              category,
              minPrice: minPrice !== null ? minPrice.toString() : null,
              maxPrice: maxPrice !== null ? maxPrice.toString() : null,
              sort: sortValue,
              page,
              limit,
            },
          },
        ),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/products/:slug", async (request, response, next) => {
    try {
      const product = await service.getProductBySlug(request.params.slug);

      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
      }

      response.json(buildSuccessResponse(product, { slug: product.slug }));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
