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
 *  - Token JWT automático (via localStorage)
 *  - Tratamento de erros de autenticação
 */

// 🌐 Usa variável de ambiente no Render, com fallback local:
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

// 🔗 Garante que o prefixo /api/v1 esteja sempre presente
const API_BASE_URL = `${BASE_URL}/api/v1`;

// 🔧 Cria a instância principal do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // use true se trabalhar com cookies de sessão
});

// =============================================================
// 1️⃣ Interceptor de Requisição — adiciona token JWT automaticamente
// =============================================================
api.interceptors.request.use(
  (config) => {
    try {
      // Aqui usamos o mesmo padrão do AuthContext (token + user separados)
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Erro ao adicionar token ao header:', err);
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
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou token inválido. Faça login novamente.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // opcional: redirecionar para login (se preferir)
    }
    return Promise.reject(error);
  }
);

export default api;
