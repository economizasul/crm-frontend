// src/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

export const AuthProvider = ({ children }) => {
    
    const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem(USER_KEY);
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Erro ao ler dados do usuário do localStorage", e);
            localStorage.removeItem(USER_KEY);
            return null;
        }
    });
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Efeito para verificar o token e sincronizar o estado
    useEffect(() => {
        let valid = false;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    valid = true;
                } else {
                    console.log("Token expirado.");
                    logout(); 
                }
            } catch (e) {
                console.error("Token inválido", e);
                logout(); 
            }
        }
        
        setIsAuthenticated(valid && !!user); 
        setIsAuthReady(true);
    }, [token, user]); 

    // Função de LOGIN
    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData); 
        setIsAuthenticated(true);
        
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData)); 
    };

    // Função de LOGOUT
    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };
    
    // Função para atualizar apenas o usuário
    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
    }

    // NOVO: Atualiza o usuário do backend
    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedUser = res.data;
            setUser(updatedUser);
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isAuthReady, 
            user, 
            token, 
            login, 
            logout,
            updateUser,
            refreshUser // Exposto
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);