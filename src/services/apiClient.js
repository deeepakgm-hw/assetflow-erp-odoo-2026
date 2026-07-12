const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || "admin@assetflow.com";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Admin@123";

let authToken = localStorage.getItem("af_api_token") || "";

const loginDemoUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    })
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to login to AssetFlow API");
  }

  authToken = payload.data.token;
  localStorage.setItem("af_api_token", authToken);
  return authToken;
};

export const apiClient = {
  async request(path, options = {}) {
    const makeRequest = async () => fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {})
      }
    });

    if (!authToken) {
      await loginDemoUser();
    }

    let response = await makeRequest();
    if (response.status === 401) {
      await loginDemoUser();
      response = await makeRequest();
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      const error = new Error(payload.message || "AssetFlow API request failed");
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload.data;
  },

  get(path) {
    return this.request(path);
  },

  post(path, body) {
    return this.request(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  patch(path, body = {}) {
    return this.request(path, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }
};
