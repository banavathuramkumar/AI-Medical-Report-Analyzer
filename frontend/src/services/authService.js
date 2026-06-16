import { fetchJson } from "./api";

export const authService = {
  async register(name, email, password) {
    const data = await fetchJson("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      window.dispatchEvent(new Event("auth-changed"));
    }
    return data.user;
  },

  async login(email, password) {
    const data = await fetchJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      window.dispatchEvent(new Event("auth-changed"));
    }
    return data.user;
  },

  async getProfile() {
    return fetchJson("/auth/profile");
  },

  logout() {
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("auth-changed"));
  },

  isLoggedIn() {
    return !!localStorage.getItem("auth_token");
  },
};
