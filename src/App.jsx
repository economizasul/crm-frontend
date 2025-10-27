// src/App.jsx - CÓDIGO FINAL COM ROTAS ANINHADAS PARA O LAYOUT FIXO

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
// A importação de Register.jsx é mantida, mas a rota é movida
import Register from './Register.jsx'; 

// NOVO: Importa o componente de Troca de Senha
import ChangePassword from './ChangePassword.jsx';

// Componentes de Layout e Conteúdo (Novas importações)
import Dashboard from './Dashboard.jsx'; // O componente de layout (Sidebar + Outlet)
import KanbanBoard from './KanbanBoard.jsx'; // O conteúdo do Dashboard
import LeadSearch from './LeadSearch.jsx'; // Tela de Busca/Lista
import LeadForm from './LeadForm.jsx'; // Cadastro ou Edição de Lead (antigo /leads/cadastro)

// Componente para proteger rotas (Mantido do seu código)
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

// Componente para redirecionar após login (Mantido do seu código)
const RedirectAfterLogin = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated && location.pathname === '/login') {
            // Usa navigate em
            return <Navigate to="/dashboard" replace />;
        }
    }, [isAuthenticated, location.pathname]);

    // O componente original tinha esta lógica, mantive para não quebrar o fluxo.
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                {/* Rota pública de Registro foi REMOVIDA */}
                
                {/* Redirecionamento de / para /dashboard se logado */}
                <Route path="/" element={<RedirectAfterLogin />} />

                {/* Rotas Protegidas (Exigem login) - O elemento ProtectedRoute aplica o guarda. O elemento Dashboard fornece o layout (Sidebar + Outlet) */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    {/* Rotas Filhas: Renderizadas dentro do <Outlet /> do Dashboard */}
                    
                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    
                    {/* 2. Busca/Lista de Leads */}
                    <Route path="/leads" element={<LeadSearch />} /> 
                    
                    {/* 3. Cadastro/Edição de Leads */}
                    <Route path="/register-lead" element={<LeadForm />} />
                    
                    {/* NOVO: Rota para Cadastro de Novo Usuário (Admin-Only) */}
                    <Route path="/user-register" element={<Register />} /> 
                    
                    {/* NOVO: Rota para Troca de Senha do Usuário (Admin e User) */}
                    <Route path="/change-password" element={<ChangePassword />} /> 
                    
                    {/* Exemplo de Rota de Configurações (Pode ser ajustada para uma tela real de settings) */}
                    <Route path="/settings" element={<div>Página de Configurações Gerais</div>} />

                </Route>
                
                {/* Rota curinga (404) - Se nenhuma rota aninhada ou pública for encontrada */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;