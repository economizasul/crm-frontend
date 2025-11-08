// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://crm-backend-xxxx.onrender.com/api', // SUBSTITUA PELO SEU LINK DO BACKEND
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token automaticamente em TODAS as requisições
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;