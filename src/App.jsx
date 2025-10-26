// src/App.jsx - CÓDIGO FINAL COM ROTAS ANINHADAS PARA O LAYOUT FIXO

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 

// Componentes de Layout e Conteúdo
import Dashboard from './Dashboard.jsx'; // O componente de layout (Sidebar + Outlet)
import KanbanBoard from './KanbanBoard.jsx'; // O conteúdo do Dashboard
import LeadSearch from './LeadSearch.jsx'; // Tela de Busca/Lista
import LeadForm from './LeadForm.jsx'; // Cadastro ou Edição de Lead

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
    // Renderiza o componente ou redireciona para o login
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para redirecionar após login
const RedirectAfterLogin = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated && location.pathname === '/login') {
            // Redireciona para o dashboard se já estiver autenticado na tela de login
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

                {/* 🚨 Rota de Layout Protegida:
                    O elemento ProtectedRoute aplica o guarda. O elemento Dashboard fornece o layout (Sidebar + Outlet) 
                */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    {/* Rotas Filhas: Renderizadas dentro do <Outlet /> do Dashboard */}
                    
                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    
                    {/* 2. Busca/Lista de Leads */}
                    <Route path="/leads" element={<LeadSearch />} /> 
                    
                    {/* 3. Cadastro/Edição de Leads */}
                    <Route path="/register-lead" element={<LeadForm />} />
                    
                    {/* Rotas de rodapé */}
                    <Route path="/reports" element={<div>Página de Relatórios (em desenvolvimento)</div>} />
                    <Route path="/settings" element={<div>Página de Configurações (em desenvolvimento)</div>} />

                </Route>
                
                {/* Rota curinga (404) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;