import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Criação do Contexto
const AuthContext = createContext();

// Hook personalizado para fácil acesso ao contexto
export const useAuth = () => useContext(AuthContext);

// 2. Provedor do Contexto
export const AuthProvider = ({ children }) => {
    // Tenta carregar o token e o userId do localStorage na inicialização
    // Usamos null/false como valores iniciais para que o useEffect preencha
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Estado para sinalizar que a verificação inicial terminou. CRUCIAL.
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Efeito para carregar o estado inicial de autenticação do localStorage
    useEffect(() => {
        const initialToken = localStorage.getItem('token');
        const initialUserId = localStorage.getItem('userId');
        
        if (initialToken) {
            setToken(initialToken);
            setUserId(initialUserId);
            setIsAuthenticated(true);
        }
        setIsAuthReady(true); // O estado inicial foi verificado
    }, []);

    // Função de login que atualiza o localStorage E o estado React
    const login = (newToken, newUserId) => {
        // 1. Salva no localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', newUserId);
        
        // 2. Atualiza o estado
        setToken(newToken);
        setUserId(newUserId);
        setIsAuthenticated(true);
    };

    // Função de logout que limpa o localStorage E o estado React
    const logout = () => {
        // 1. Remove do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // 2. Limpa o estado
        setToken(null);
        setUserId(null);
        setIsAuthenticated(false);
    };

    const value = {
        token,
        userId,
        isAuthenticated,
        isAuthReady, // Indica que o token inicial foi lido
        login,
        logout,
    };

    // Renderiza children apenas quando o estado de autenticação estiver pronto
    if (!isAuthReady) {
        // Você pode colocar um spinner ou tela de carregamento aqui
        return <div className="min-h-screen flex items-center justify-center text-indigo-600 text-lg">Carregando Sessão...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
