import {
  categories as staticCategories,
  products as staticProducts,
} from "../data/catalogueData";

export const sortOptions = [
  { value: "featured", label: "Featured order" },
  { value: "name-asc", label: "Name, A–Z" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

export function formatPrice(price) {
  const numericValue = Number(price ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "£0.00";
  }

  if (Number.isInteger(numericValue) && numericValue >= 100) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(numericValue / 100);
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(numericValue);
}

export function normalizeProductForFrontend(product) {
  const category =
    product.category && typeof product.category === "object"
      ? product.category
      : null;
  const categoryId = category?.slug || category?.id || product.categoryId || "";
  const productId = product.slug || product.id;
  const basePrice =
    product.priceMinor !== undefined && product.priceMinor !== null
      ? Number(product.priceMinor) / 100
      : Number(product.price ?? 0);

  return {
    id: productId,
    slug: product.slug || productId,
    name: product.name,
    description: product.description,
    categoryId,
    category,
    price: Number(basePrice.toFixed(2)),
    priceMinor: Number(
      product.priceMinor ?? Math.round(Number(product.price ?? 0) * 100),
    ),
    unit: product.unit,
    image: product.image || "/placeholders/default.svg",
    demo: product.demo ?? true,
  };
}

export function getCategoryName(categoryId, categoriesList = staticCategories) {
  if (typeof categoryId === "object") {
    return categoryId.name ?? "Grocery item";
  }

  const category = categoriesList.find(
    (item) => item.id === categoryId || item.slug === categoryId,
  );

  return category?.name ?? "Grocery item";
}

export function getProductBySlug(slug) {
  return staticProducts.find((product) => product.id === slug);
}

export function parseCatalogueState(searchParams) {
  const requestedCategory = searchParams.get("category") ?? "";
  const category = staticCategories.some(
    (item) => item.id === requestedCategory || item.slug === requestedCategory,
  )
    ? requestedCategory
    : "";
  const sort = sortOptions.some(
    (item) => item.value === searchParams.get("sort"),
  )
    ? searchParams.get("sort")
    : "featured";
  const minPrice = parsePriceParam(searchParams.get("minPrice"));
  const maxPrice = parsePriceParam(searchParams.get("maxPrice"));
  return {
    query: searchParams.get("q") ?? "",
    category,
    minPrice,
    maxPrice,
    sort,
  };
}

function parsePriceParam(value) {
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) return "";
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? value : "";
}

export function getFilteredProducts(state, productsList = staticProducts) {
  const query = state.query.trim().toLowerCase();
  const filtered = productsList.filter((product) => {
    const matchesQuery =
      !query ||
      `${product.name} ${product.description}`.toLowerCase().includes(query);
    const matchesCategory =
      !state.category || product.categoryId === state.category;
    const price = product.price;
    const matchesMinimum = !state.minPrice || price >= Number(state.minPrice);
    const matchesMaximum = !state.maxPrice || price <= Number(state.maxPrice);
    return matchesQuery && matchesCategory && matchesMinimum && matchesMaximum;
  });

  if (state.sort === "name-asc")
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "price-asc")
    return filtered.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc")
    return filtered.sort((a, b) => b.price - a.price);
  return filtered;
}
