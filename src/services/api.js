// src/services/api.js

import axios from 'axios';

// Base URL do backend
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL || 'https://crm-app-cnf7.onrender.com/api/v1',
  withCredentials: true, // mantém compatibilidade com cookies/session se necessário
});

// Interceptor para adicionar automaticamente o token JWT nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição Axios:', error);
    return Promise.reject(error);
  }
);

export default api;
