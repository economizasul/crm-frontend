// src/App.jsx - CÓDIGO FINAL COM ROTAS ANINHADAS PARA O LAYOUT FIXO

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
// NOVO: Importa o componente de Troca de Senha (Assumindo que você o criou)
import ChangePassword from './ChangePassword.jsx';

// Componentes de Layout e Conteúdo
import Dashboard from './Dashboard.jsx'; 
import KanbanBoard from './KanbanBoard.jsx'; 
import LeadSearch from './LeadSearch.jsx'; 
import LeadForm from './LeadForm.jsx'; 

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
        if (isAuthenticated && location.pathname === '/login') {
            // Se o usuário está autenticado e na tela de login, redireciona para o dashboard
            // Usa navigate em um useEffect, mas aqui a lógica de redirecionamento está implícita no fluxo da rota.
        }
    }, [isAuthenticated, location]); 

    // Se estiver logado, redireciona para o dashboard, senão renderiza o Login.jsx
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};


function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<RedirectAfterLogin />} />
                <Route path="/register" element={<Register />} /> 
                
                {/* Rotas Protegidas (Layout Principal) - O elemento ProtectedRoute aplica o guarda. O elemento Dashboard fornece o layout (Sidebar + Outlet) */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    {/* Rotas Filhas: Renderizadas dentro do <Outlet /> do Dashboard */}
                    
                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    
                    {/* 2. Busca/Lista de Leads */}
                    <Route path="/leads" element={<LeadSearch />} /> 
                    
                    {/* 3. Cadastro/Edição de Leads */}
                    <Route path="/register-lead" element={<LeadForm />} />
                    {/* 💡 CORREÇÃO CRÍTICA: Rota para Edição com ID dinâmico */}
                    <Route path="/register-lead/:id" element={<LeadForm />} /> 
                    
                    {/* Outras Rotas (Mantidas do snippet) */}
                    <Route path="/user-register" element={<Register />} /> 
                    <Route path="/change-password" element={<ChangePassword />} /> 
                    <Route path="/reports" element={<div>Página de Relatórios</div>} />
                    <Route path="/settings" element={<div>Página de Configurações</div>} />

                </Route>
                
                {/* Rota curinga (404) - Se nenhuma rota aninhada ou pública for encontrada */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;