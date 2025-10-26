// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com/api/v1';

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o Provedor
export const AuthProvider = ({ children }) => {
    // Estado de autenticação: null (inicial/carregando), string (token), ou false (não autenticado)
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isAuthReady, setIsAuthReady] = useState(false); // Indica se a verificação inicial terminou
    const [user, setUser] = useState(null);

    // Efeito para sincronizar o estado com o localStorage na inicialização
    useEffect(() => {
        if (token) {
            // Se houver um token, tentamos carregar dados do usuário (opcional, mas recomendado)
            // Por simplicidade, assumimos que o token é válido para iniciar
            setIsAuthenticated(true);
            // Aqui você pode adicionar uma chamada à API para validar o token e buscar dados do user
        }
        setIsAuthReady(true); // O contexto está pronto
    }, [token]);

    // Função de Login
    const login = useCallback(async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error("Erro de Login:", error);
            // Retorna a mensagem de erro da API ou uma mensagem padrão
            return { 
                success: false, 
                message: error.response?.data?.error || 'Credenciais inválidas ou erro de conexão.' 
            };
        }
    }, []);

    // Função de Logout
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // Valor do Contexto
    const value = {
        isAuthenticated,
        isAuthReady,
        user,
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Cria o Hook Personalizado (🚨 CORREÇÃO: Adicionamos o 'export' aqui)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};