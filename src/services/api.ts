import axios from "axios";
import { userLocalStoreKey } from "../hooks/use-user";

const rawBaseURL = import.meta.env.VITE_API_URL || "https://elite-tracker-api.onrender.com/api";
const trimmedBaseURL = rawBaseURL.replace(/\/+$/, "");
const baseURL = trimmedBaseURL.endsWith("/auth")
  ? trimmedBaseURL.slice(0, -"/auth".length)
  : trimmedBaseURL;

console.log("API Base URL:", baseURL); // Debug log

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const userData = localStorage.getItem(userLocalStoreKey);

  const token = userData && JSON.parse(userData).token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
