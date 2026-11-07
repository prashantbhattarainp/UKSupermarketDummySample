const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(
      payload?.error?.message || "Store information could not be loaded.",
    );
  return payload.data;
}

export async function fetchStoreContent() {
  const [store, hours, services] = await Promise.all([
    request("/store"),
    request("/store/hours"),
    request("/services"),
  ]);
  if (!store?.name) throw new Error("Store information is not configured.");
  return { store, hours, services };
}
