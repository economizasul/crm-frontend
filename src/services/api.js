// src/services/api.js

import axios from 'axios';

/**
 * =============================================================
 * CONFIGURAÇÃO CENTRAL DA API
 * =============================================================
 * Apenas corrige a leitura do token do localStorage.
 */

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// =============================================================
// 1️⃣ Interceptor de Requisição — adiciona token JWT automaticamente
// =============================================================
api.interceptors.request.use(
  (config) => {
    // 🔹 Agora pega token do AuthContext / localStorage corretamente
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================
// 2️⃣ Interceptor de Resposta — trata erros 401
// =============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      console.warn('Sessão expirada ou token inválido. Faça login novamente.');
      // Opcional: aqui pode chamar logout do AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
