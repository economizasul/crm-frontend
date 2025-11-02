// src/services/api.js

import axios from 'axios';

/**
 * =============================================================
 * CONFIGURAÇÃO CENTRAL DA API (FRONTEND + BACKEND SEPARADOS)
 * =============================================================
 * Corrigido para usar o token salvo pelo AuthContext ('token').
 * Mantém compatibilidade total com o backend.
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
    try {
      // Corrigido: pega o token salvo diretamente
      const token = localStorage.getItem('token');

      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token.replace(/['"]+/g, '')}`;
      } else {
        console.warn('⚠️ Nenhum token encontrado no localStorage.');
      }
    } catch (err) {
      console.error('Erro ao recuperar token do localStorage:', err);
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
      console.warn('🚫 Token inválido ou expirado.');
      // Opcional: limpar token e redirecionar para login
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================================
// Exporta a instância pronta para uso em todo o projeto
// =============================================================
export default api;
