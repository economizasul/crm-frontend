// src/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Você provavelmente usa isto para verificar o token

const AuthContext = createContext(null);

// Nomes das chaves no localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'user'; // CRÍTICO: Chave para armazenar o objeto de usuário completo

export const AuthProvider = ({ children }) => {
    // Inicializa o estado lendo o token e os dados do usuário do localStorage
    const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
    // CRÍTICO: Tenta desserializar os dados do usuário. Usa um bloco try/catch.
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
                // Verifica se o token não expirou
                if (decoded.exp * 1000 > Date.now()) {
                    valid = true;
                } else {
                    // Token expirado
                    console.log("Token expirado.");
                    logout(); 
                }
            } catch (e) {
                console.error("Token inválido", e);
                logout(); 
            }
        }
        
        // CRÍTICO: Garante que o estado de autenticação reflita o token e o objeto user
        setIsAuthenticated(valid && !!user); 
        setIsAuthReady(true);
    }, [token, user]); // Dependência em 'user' para reagir a atualizações (como a role)

    // Função de LOGIN
    const login = (newToken, userData) => {
        // 1. Atualiza o estado
        setToken(newToken);
        setUser(userData); // CRÍTICO: Salva o objeto completo que contém a role
        setIsAuthenticated(true);
        
        // 2. Persiste no localStorage
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData)); // CRÍTICO: Persiste o objeto user
    };

    // Função de LOGOUT
    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY); // CRÍTICO: Remove o user
    };
    
    // Função para atualizar apenas o usuário (ex: após mudar a senha)
    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
    }


    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isAuthReady, 
            user, 
            token, 
            login, 
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);S