import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy to backend
  headers: {
    'Content-Type': 'application/json',
  },
});


// Attach token to every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // or sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
