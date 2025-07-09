import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxy to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
