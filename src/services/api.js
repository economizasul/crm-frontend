// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://crm-app-cnf7.onrender.com/api/v1'; // SEU BACKEND CORRETO

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token automático em TODAS as requisições
api.interceptors.request.use((config) => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  if (userData.token) {
    config.headers.Authorization = `Bearer ${userData.token}`;
  }
  return config;
});

export default api;