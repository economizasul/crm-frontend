// src/services/api.js

import axios from 'axios';

// =============================================================
// CORREÇÃO CRÍTICA DE URL PARA DEPLOY EM AMBIENTES SEPARADOS (RENDER)
// =============================================================
// Troque a URL abaixo APENAS SE o endereço do seu backend mudar.
// O seu backend está em: https://crm-app-cnf7.onrender.com/api
const BACKEND_URL = 'https://crm-app-cnf7.onrender.com/api/v1'; // Incluindo o prefixo da versão da API

const api = axios.create({
    // Usa o URL completo do backend
    baseURL: BACKEND_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor de Requisição: Adiciona o token JWT
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    let token = null;
    
    try {
        if (userInfo) {
            token = JSON.parse(userInfo).token;
        }
    } catch (e) {
        console.error("Erro ao parsear userInfo do localStorage:", e);
    }

    if (token) {
        // ESSENCIAL: Adiciona o token ao cabeçalho de Autorização (Bearer Token)
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. Interceptor de Resposta: Para lidar com 401/Sessão Expirada (Melhoria)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se for 401 (Unauthorized) e o user estava logado (userInfo existe)
        if (error.response?.status === 401 && localStorage.getItem('userInfo')) {
            console.error("Sessão expirada ou token inválido. Por favor, faça login novamente.");
            // 🚨 Ação de deslogar deve ser gerenciada pelo seu AuthContext (ex: forçar logout)
        }
        return Promise.reject(error);
    }
);

// O export default é o que permite que outros arquivos usem 'import api from ...'
export default api;