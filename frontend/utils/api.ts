import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // Our FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the JWT token to every request if we have it
api.interceptors.request.use((config) => {
  // We will store the token in localStorage later
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;