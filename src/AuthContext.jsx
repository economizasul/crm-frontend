// src/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
// CRÍTICO: Certifique-se de que a importação é feita desta forma, conforme o pacote.
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user'; 

export const AuthProvider = ({ children }) => {
    
    // ... restante da lógica de inicialização (mantida da última sugestão)
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

export const useAuth = () => useContext(AuthContext);