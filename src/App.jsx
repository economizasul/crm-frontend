// src/App.jsx - CÓDIGO REESCRITO E OTIMIZADO

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx'; // Container principal (Sidebar + Conteúdo)
import LeadForm from './LeadForm.jsx'; // Cadastro ou Edição de Lead
import LeadSearch from './LeadSearch.jsx'; // Tela de Busca/Lista

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isAuthReady } = useAuth();
    
    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span>Carregando...</span>
            </div>
        );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para redirecionar após login
const RedirectAfterLogin = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    React.useEffect(() => {
        // Redireciona apenas se estiver autenticado e na tela de login
        if (isAuthenticated && location.pathname === '/login') {
            window.location.href = '/dashboard'; 
        }
    }, [isAuthenticated, location]);

    return null;
};

function App() {
    return (
        <AuthProvider> 
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<><Login /><RedirectAfterLogin /></>} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Rotas Protegidas */}
                
                {/* 1. Rota principal: Exibe o Sidebar + Conteúdo (Kanban) */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                {/* 2. Rota de Cadastro/Edição de Leads */}
                <Route path="/leads/cadastro" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
                
                {/* 3. Rota de Busca/Lista de Leads - Onde o erro está */}
                <Route path="/search-lead" element={<ProtectedRoute><LeadSearch /></ProtectedRoute>} />
                
                {/* Rota curinga (404) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;