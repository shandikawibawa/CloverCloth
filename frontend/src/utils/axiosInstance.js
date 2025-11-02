// src/utils/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor → tambahkan token dari localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika token kadaluarsa (401), redirect ke login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/login"; // Redirect user ke login page
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
