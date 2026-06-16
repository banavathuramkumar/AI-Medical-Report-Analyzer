const BASE_URL = "/api";

export function getHeaders() {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchJson(endpoint, options = {}) {
  const headers = getHeaders();
  
  // Do not set Content-Type header if body is FormData (browser will set it automatically with boundary)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("auth-changed"));
  }

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred");
  }

  return data;
}
