// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from './services/api.js'; // AGORA USA O api.js COM INTERCEPTOR!

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // CARREGA DO localStorage NA INICIALIZAÇÃO
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Verifica se o token ainda é válido
          const decoded = jwtDecode(storedToken);
          if (decoded.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);

            // FORÇA O TOKEN NO AXIOS (api.js)
            api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          } else {
            console.log("Token expirado ao carregar.");
            logout();
          }
        }
      } catch (e) {
        console.error("Erro ao carregar autenticação:", e);
        logout();
      } finally {
        setIsAuthReady(true);
      }
    };

    loadStoredAuth();
  }, []);

  // FUNÇÃO DE LOGIN
  const login = (newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);

    // FORÇA O TOKEN NO AXIOS
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
  };

  // FUNÇÃO DE LOGOUT
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // REMOVE O TOKEN DO AXIOS
    delete api.defaults.headers.Authorization;
  };

  // ATUALIZA USUÁRIO
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
  };

  // ATUALIZA DO BACKEND
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      if (err.response?.status === 401) {
        logout();
      }
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
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};