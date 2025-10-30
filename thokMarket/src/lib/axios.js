import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // 👈 यहाँ `/api` जोड़ दो
  withCredentials: true,
});

export default api;