import axios from "axios";


const api = axios.create({
  baseURL: "https://thokmarket-2-o.onrender.com",
  withCredentials: true,
});

export default api;
