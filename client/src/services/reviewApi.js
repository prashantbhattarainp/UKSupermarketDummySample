const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export async function fetchReviews() {
  const response = await fetch(`${API_BASE_URL}/reviews`);
  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload?.error?.message || "Reviews could not be loaded.");
  return payload.data || [];
}

export async function submitReview(review) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(
      payload?.error?.message || "Review could not be submitted.",
    );
    error.fieldErrors = payload?.error?.fieldErrors || {};
    throw error;
  }
  return payload.data;
}
