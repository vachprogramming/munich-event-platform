import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // Use environment variable if available, otherwise localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
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