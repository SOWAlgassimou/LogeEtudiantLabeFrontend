import axios from "axios";

// Base URL from Vite env (e.g., VITE_API_URL=http://localhost:5000/api)
const baseURL = (import.meta?.env?.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Central axios instance for the app
const http = axios.create({
  baseURL,
  withCredentials: false, // set true only if backend expects cookies
});

function getToken() {
  try {
    return localStorage.getItem("token");
  } catch (_) {
    return null;
  }
}

// Attach Authorization header if token exists
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized 401 handling: cleanup and redirect to login
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("utilisateurConnecte");
      } catch (_) {}
      if (typeof window !== "undefined" && window.location.pathname !== "/connexion") {
        window.location.href = "/connexion";
      }
    }
    return Promise.reject(error);
  }
);

// Helpers for controlling token/baseURL programmatically
export function setAuthToken(token) {
  if (token) {
    try { localStorage.setItem("token", token); } catch (_) {}
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    try { localStorage.removeItem("token"); } catch (_) {}
    delete http.defaults.headers.common.Authorization;
  }
}

export function setBaseURL(url) {
  if (url) {
    http.defaults.baseURL = url.replace(/\/$/, "");
  }
}

export { http };
