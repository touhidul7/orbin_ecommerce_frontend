import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export const doRegister = async (data) => {
  const response = await api.post("/register", data);
  return response.data;
};

export const doSignInWithPhoneAndPassword = async (phone, password) => {
  const response = await api.post("/login", { phone, password });
  return response.data;
};

export const doSignOut = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await api.post("/logout", {});
    }
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export { api };