import { getCsrfToken } from "./authApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

async function requestOwnerJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(
      payload?.error?.message || "The management request failed.",
    );
    error.status = response.status;
    error.code = payload?.error?.code;
    error.fieldErrors = payload?.error?.fieldErrors || {};
    throw error;
  }
  return payload;
}

async function mutate(path, method, body) {
  const csrfToken = await getCsrfToken();
  return requestOwnerJson(path, {
    method,
    headers: { "X-CSRF-Token": csrfToken },
    body: JSON.stringify(body),
  });
}

function queryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function fetchOwnerProducts(filters = {}) {
  const payload = await requestOwnerJson(
    `/owner/products${queryString(filters)}`,
  );
  return {
    items: payload.data || [],
    pagination: payload.meta?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function fetchOwnerProduct(id) {
  const payload = await requestOwnerJson(`/owner/products/${id}`);
  return payload.data;
}

export async function createOwnerProduct(product) {
  const payload = await mutate("/owner/products", "POST", product);
  return payload.data;
}

export async function updateOwnerProduct(id, product) {
  const payload = await mutate(`/owner/products/${id}`, "PATCH", product);
  return payload.data;
}

export async function deactivateOwnerProduct(id) {
  const payload = await mutate(`/owner/products/${id}`, "DELETE");
  return payload.data;
}

export async function fetchOwnerCategories() {
  const payload = await requestOwnerJson("/owner/categories");
  return payload.data || [];
}

export async function fetchOwnerCategory(id) {
  const payload = await requestOwnerJson(`/owner/categories/${id}`);
  return payload.data;
}

export async function createOwnerCategory(category) {
  const payload = await mutate("/owner/categories", "POST", category);
  return payload.data;
}

export async function updateOwnerCategory(id, category) {
  const payload = await mutate(`/owner/categories/${id}`, "PATCH", category);
  return payload.data;
}

export async function deactivateOwnerCategory(id) {
  const payload = await mutate(`/owner/categories/${id}`, "DELETE");
  return payload.data;
}

export async function fetchOwnerPromotions(filters = {}) {
  const payload = await requestOwnerJson(
    `/owner/promotions${queryString(filters)}`,
  );
  return {
    items: payload.data || [],
    pagination: payload.meta?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function fetchOwnerPromotion(id) {
  const payload = await requestOwnerJson(`/owner/promotions/${id}`);
  return payload.data;
}

export async function createOwnerPromotion(promotion) {
  const payload = await mutate("/owner/promotions", "POST", promotion);
  return payload.data;
}

export async function updateOwnerPromotion(id, promotion) {
  const payload = await mutate(`/owner/promotions/${id}`, "PATCH", promotion);
  return payload.data;
}

export async function deactivateOwnerPromotion(id) {
  const payload = await mutate(`/owner/promotions/${id}`, "DELETE");
  return payload.data;
}

async function ownerRequest(path, options = {}) {
  const csrfToken =
    options.method && options.method !== "GET" ? await getCsrfToken() : "";
  return requestOwnerJson(path, {
    ...options,
    headers: {
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...(options.headers || {}),
    },
  });
}

export async function fetchOwnerStore() {
  return (await ownerRequest("/owner/store")).data;
}
export async function updateOwnerStore(store) {
  return (
    await ownerRequest("/owner/store", {
      method: "PATCH",
      body: JSON.stringify(store),
    })
  ).data;
}
export async function fetchOwnerHours() {
  return (await ownerRequest("/owner/store/hours")).data;
}
export async function updateOwnerHours(hours) {
  return (
    await ownerRequest("/owner/store/hours", {
      method: "PATCH",
      body: JSON.stringify(hours),
    })
  ).data;
}
export async function fetchOwnerServices() {
  return (await ownerRequest("/owner/services")).data || [];
}
export async function createOwnerService(service) {
  return (
    await ownerRequest("/owner/services", {
      method: "POST",
      body: JSON.stringify(service),
    })
  ).data;
}
export async function updateOwnerService(id, service) {
  return (
    await ownerRequest(`/owner/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(service),
    })
  ).data;
}
export async function deactivateOwnerService(id) {
  return (await ownerRequest(`/owner/services/${id}`, { method: "DELETE" }))
    .data;
}

export async function fetchOwnerReviews(status = "") {
  return (
    (
      await ownerRequest(
        `/owner/reviews${status ? `?status=${encodeURIComponent(status)}` : ""}`,
      )
    ).data || []
  );
}
export async function moderateOwnerReview(id, status) {
  return (
    await ownerRequest(`/owner/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  ).data;
}
