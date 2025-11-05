// src/App.jsx 

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx'; 
import Register from './pages/Register.jsx'; 
import ChangePassword from './pages/ChangePassword.jsx';

// Componentes de Layout e Conteúdo
import Dashboard from './components/Dashboard.jsx'; // Dashboard é o Layout (Sidebar + Conteúdo)
import KanbanBoard from './pages/KanbanBoard.jsx'; // Conteúdo principal
import LeadSearch from './pages/LeadSearch.jsx'; // Conteúdo
import LeadForm from './pages/LeadForm.jsx'; // Conteúdo para cadastro/edição
import ReportsPage from './pages/ReportsPage.jsx'; // Página de Relatórios
import Configuracoes from './pages/Configuracoes.jsx'; // Página de Configurações

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
    // Redireciona para o login se não estiver autenticado
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente principal da aplicação
function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rotas Protegidas - Usam o componente Dashboard como Layout */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    <Route index element={<Navigate to="/dashboard" replace />} /> {/* Rota raiz aponta para dashboard */}

                    {/* 1. Dashboard Principal (Kanban Board) */}
                    {/* CORREÇÃO: Mudança de path="/dashboard" para path="dashboard" */}
                    <Route path="dashboard" element={<KanbanBoard />} />

                    {/* 2. Busca/Lista de Leads */}
                    {/* CORREÇÃO: Mudança de path="/leads" para path="leads" */}
                    <Route path="leads" element={<LeadSearch />} />

                    {/* 3. Cadastro/Edição de Leads */}
                    {/* CORREÇÃO: Mudança de path="/register-lead" para path="register-lead" */}
                    <Route path="register-lead" element={<LeadForm />} />
                    {/* CRÍTICO: Rota para Edição com ID dinâmico */}
                    {/* CORREÇÃO: Mudança de path="/register-lead/:id" para path="register-lead/:id" */}
                    <Route path="register-lead/:id" element={<LeadForm />} />

                    {/* 4. Gerenciamento de Usuários */}
                    {/* CORREÇÃO: Mudança de path="/user-register" para path="user-register" */}
                    <Route path="user-register" element={<Register />} />
                    
                    {/* 5. Troca de Senha */}
                    {/* CORREÇÃO: Mudança de path="/change-password" para path="change-password" */}
                    <Route path="change-password" element={<ChangePassword />} />

                    {/* 6. Relatórios */}
                    {/* CORREÇÃO: Mudança de path="/reports" para path="reports" */}
                    <Route path="reports" element={<ReportsPage />} />

                    {/* 7. Configurações */}
                    {/* CORREÇÃO: Mudança de path="/settings" para path="settings" */}
                    <Route path="settings" element={<Configuracoes />} />

                </Route>

                {/* Rota curinga (404) - Redireciona para /dashboard se nenhuma rota corresponder */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;