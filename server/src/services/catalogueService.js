import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

const VALID_SORT_OPTIONS = new Set([
  "featured",
  "name-asc",
  "price-asc",
  "price-desc",
]);

export function convertPriceToMinorUnits(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error("Price values must be zero or more.");
  }

  return Math.round(numericValue * 100);
}

export function convertMinorUnitsToPrice(value) {
  const numericValue = Number(value ?? 0);
  return Number((numericValue / 100).toFixed(2));
}

function toCategoryPayload(category) {
  if (!category) return null;

  const categoryId = category._id ? category._id.toString() : category.id;

  return {
    id: categoryId,
    slug: category.slug,
    name: category.name,
    description: category.description ?? "",
    active: category.active,
    displayOrder: category.displayOrder ?? 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function toProductPayload(product) {
  const category =
    product.category && typeof product.category === "object"
      ? product.category
      : null;

  return {
    id: product.slug,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: category ? toCategoryPayload(category) : null,
    categoryId: category
      ? category.slug
      : (product.category?.toString?.() ?? null),
    priceMinor: Number(product.priceMinor),
    price: convertMinorUnitsToPrice(product.priceMinor),
    unit: product.unit,
    image: product.image ?? "",
    active: product.active,
    featured: product.featured ?? false,
    displayOrder: product.displayOrder ?? 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function sanitizeSort(sort) {
  if (!sort || sort === "featured") {
    return { sortKey: "featured" };
  }

  if (!VALID_SORT_OPTIONS.has(sort)) {
    throw Object.assign(new Error("Sort order is not supported."), {
      statusCode: 400,
      code: "INVALID_SORT",
    });
  }

  return { sortKey: sort };
}

function sanitizePage(page) {
  const numericPage = Number(page ?? 1);

  if (!Number.isInteger(numericPage) || numericPage < 1) {
    throw Object.assign(new Error("Page must be a positive integer."), {
      statusCode: 400,
      code: "INVALID_PAGE",
    });
  }

  return numericPage;
}

function sanitizeLimit(limit) {
  const numericLimit = Number(limit ?? 12);

  if (!Number.isInteger(numericLimit) || numericLimit < 1) {
    throw Object.assign(new Error("Limit must be a positive integer."), {
      statusCode: 400,
      code: "INVALID_LIMIT",
    });
  }

  if (numericLimit > 50) {
    throw Object.assign(new Error("Limit cannot exceed 50."), {
      statusCode: 400,
      code: "INVALID_LIMIT",
    });
  }

  return numericLimit;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createCatalogueService({
  CategoryModel = Category,
  ProductModel = Product,
} = {}) {
  async function listCategories() {
    const categories = await CategoryModel.find({ active: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return categories.map(toCategoryPayload);
  }

  async function getCategoryBySlug(slug) {
    if (!slug) {
      return null;
    }

    const category = await CategoryModel.findOne({ slug, active: true }).lean();
    return toCategoryPayload(category);
  }

  async function listProducts({
    search = "",
    categorySlug = "",
    minPrice = null,
    maxPrice = null,
    sort = "featured",
    page = 1,
    limit = 12,
  } = {}) {
    const safePage = sanitizePage(page);
    const safeLimit = sanitizeLimit(limit);
    const selectedSort = sanitizeSort(sort);

    const query = { active: true };

    if (search && search.trim()) {
      const searchText = search.trim();
      query.$or = [
        { name: { $regex: escapeRegex(searchText), $options: "i" } },
        { description: { $regex: escapeRegex(searchText), $options: "i" } },
      ];
    }

    if (categorySlug) {
      const category = await CategoryModel.findOne({
        slug: categorySlug,
        active: true,
      }).lean();
      if (category) {
        query.category = category._id;
      } else {
        return {
          items: [],
          pagination: {
            page: safePage,
            limit: safeLimit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    if (minPrice !== null && minPrice !== undefined && minPrice !== "") {
      query.priceMinor = {
        ...(query.priceMinor ?? {}),
        $gte: convertPriceToMinorUnits(minPrice),
      };
    }

    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== "") {
      query.priceMinor = {
        ...(query.priceMinor ?? {}),
        $lte: convertPriceToMinorUnits(maxPrice),
      };
    }

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice !== "" &&
      maxPrice !== ""
    ) {
      const minMinor = convertPriceToMinorUnits(minPrice);
      const maxMinor = convertPriceToMinorUnits(maxPrice);

      if (minMinor > maxMinor) {
        throw Object.assign(
          new Error("Minimum price cannot be greater than maximum price."),
          {
            statusCode: 400,
            code: "INVALID_PRICE_RANGE",
          },
        );
      }
    }

    const sortSpec =
      selectedSort.sortKey === "featured"
        ? { displayOrder: 1, name: 1 }
        : selectedSort.sortKey === "name-asc"
          ? { name: 1, displayOrder: 1 }
          : selectedSort.sortKey === "price-asc"
            ? { priceMinor: 1, displayOrder: 1 }
            : { priceMinor: -1, displayOrder: 1 };

    const total = await ProductModel.countDocuments(query);
    const skip = (safePage - 1) * safeLimit;
    const products = await ProductModel.find(query)
      .populate("category", "name slug description active displayOrder")
      .sort(sortSpec)
      .skip(skip)
      .limit(safeLimit)
      .lean();

    return {
      items: products.map(toProductPayload),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
      },
    };
  }

  async function getProductBySlug(slug) {
    if (!slug) {
      return null;
    }

    const product = await ProductModel.findOne({ slug, active: true })
      .populate("category", "name slug description active displayOrder")
      .lean();

    return product ? toProductPayload(product) : null;
  }

  return {
    listCategories,
    getCategoryBySlug,
    listProducts,
    getProductBySlug,
  };
}
