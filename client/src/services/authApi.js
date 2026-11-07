const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

async function requestJson(path, options = {}) {
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
      payload?.error?.message || "Authentication request failed.",
    );
    error.code = payload?.error?.code;
    error.fieldErrors = payload?.error?.fieldErrors || {};
    throw error;
  }

  return payload;
}

export async function getCsrfToken() {
  const payload = await requestJson("/auth/csrf");
  return payload.data.token;
}

export async function fetchCurrentUser() {
  const payload = await requestJson("/auth/me");
  if (!payload.data?.user) {
    throw new Error("No authenticated user.");
  }
  return payload.data.user;
}

export async function loginOwner(email, password) {
  const payload = await requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return payload.data.user;
}

export async function logoutOwner() {
  const csrfToken = await getCsrfToken();
  await requestJson("/auth/logout", {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
  });
}
