const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export async function fetchPublicPromotions() {
  const response = await fetch(`${API_BASE_URL}/promotions`);
  const payload = await response.json();
  if (!response.ok)
    throw new Error(
      payload?.error?.message || "Promotions could not be loaded.",
    );
  return payload.data || [];
}
