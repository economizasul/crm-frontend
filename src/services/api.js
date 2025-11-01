// src/services/api.js

import axios from 'axios';

/**
 * =============================================================
 * CONFIGURAÇÃO CENTRAL DA API (FRONTEND + BACKEND SEPARADOS)
 * =============================================================
 * Este arquivo define a instância Axios usada em todo o frontend.
 * Ele já lida com:
 *  - URL dinâmica (Render, local ou outro ambiente)
 *  - Inclusão do prefixo da API (/api/v1)
 *  - Token JWT automático
 *  - Tratamento de erros de autenticação
 */

// 🌐 Usa variável de ambiente no Render, com fallback local:
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

// 🔗 Garante que o prefixo /api/v1 esteja sempre presente
const API_BASE_URL = `${BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // altere para true se usar cookies de sessão
});

// =============================================================
// 1️⃣ Interceptor de Requisição — adiciona token JWT automaticamente
// =============================================================
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      try {
        const token = JSON.parse(userInfo).token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Erro ao parsear userInfo do localStorage:', err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================
// 2️⃣ Interceptor de Resposta — trata erros 401 (sessão expirada)
// =============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('userInfo')) {
      console.warn('Sessão expirada ou token inválido. Faça login novamente.');
      // Aqui você pode forçar logout via AuthContext, se quiser
    }
    return Promise.reject(error);
  }
);

// =============================================================
// Exporta a instância pronta para uso em todo o projeto
// =============================================================
export default api;
