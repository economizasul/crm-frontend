// src/services/api.js

import axios from 'axios';

// =============================================================
// CORREÇÃO CRÍTICA DE URL PARA DEPLOY EM AMBIENTES SEPARADOS (RENDER)
// =============================================================
// Troque a URL abaixo APENAS SE o endereço do seu backend mudar.
// O seu backend está em: https://crm-app-cnf7.onrender.com/api
const BACKEND_URL = 'https://crm-app-cnf7.onrender.com/api'; 

const api = axios.create({
    // Usa o URL completo do backend
    baseURL: BACKEND_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor de Requisição: Adiciona o token JWT (Mantido)
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
        // ESSENCIAL: Adiciona o token ao cabeçalho de Autorização
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
        if (error.response?.status === 401) {
            console.error("ERRO 401: Sessão expirada ou não autorizado. Favor efetuar login novamente.");
            // Você pode adicionar uma lógica para forçar o logout/redirecionamento aqui.
        }
        return Promise.reject(error);
    }
);

export default api;