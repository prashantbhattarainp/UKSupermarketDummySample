const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

async function requestJson(path, params = {}) {
  const url = `${API_BASE_URL}${path}${buildQueryString(params)}`;
  const response = await fetch(url);

  if (!response.ok) {
    let payload = {};

    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }

    const message = payload?.error?.message || "The catalogue request failed.";
    throw new Error(message);
  }

  const payload = await response.json();
  return payload;
}

export function normalizeProductForFrontend(product) {
  const category =
    product.category && typeof product.category === "object"
      ? product.category
      : null;
  const productId = product.slug || product.id;
  const numericPrice =
    product.priceMinor !== undefined && product.priceMinor !== null
      ? Number(product.priceMinor) / 100
      : Number(product.price ?? 0);

  return {
    id: productId,
    slug: product.slug || productId,
    name: product.name,
    description: product.description,
    categoryId: category?.slug || category?.id || product.categoryId || "",
    category,
    price: Number(numericPrice.toFixed(2)),
    priceMinor: Number(
      product.priceMinor ?? Math.round(Number(product.price ?? 0) * 100),
    ),
    unit: product.unit,
    image: product.image || "/placeholders/default.svg",
    active: product.active ?? true,
    featured: product.featured ?? false,
    demo: product.demo ?? true,
  };
}

export async function fetchCategories() {
  const payload = await requestJson("/categories");
  return payload?.data ?? [];
}

export async function fetchProducts(filters = {}) {
  const payload = await requestJson("/products", filters);
  const data = payload?.data ?? {
    items: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  };

  return {
    items: (data.items ?? []).map(normalizeProductForFrontend),
    pagination: data.pagination ?? {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function fetchProductBySlug(slug) {
  if (!slug) {
    return null;
  }

  const payload = await requestJson(`/products/${slug}`);
  return payload?.data ? normalizeProductForFrontend(payload.data) : null;
}
