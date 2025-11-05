// src/App.jsx - CÓDIGO FINAL COM CORREÇÃO DE IMPORTS E ROTAS ANINHADAS

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './AuthContext.jsx';

// ⭐️ CORREÇÃO DOS IMPORTS: Assumindo que Login, Register e ChangePassword estão diretamente em /src/
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import ChangePassword from './ChangePassword.jsx';

// Componentes de Layout e Conteúdo
// ATENÇÃO: Mantendo os caminhos para 'pages/' nos demais, ajuste se necessário
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
                    
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* ⭐️ CORREÇÃO: Rotas Aninhadas Relativas */}
                    
                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="dashboard" element={<KanbanBoard />} />

                    {/* 2. Busca/Lista de Leads */}
                    <Route path="leads" element={<LeadSearch />} />

                    {/* 3. Cadastro/Edição de Leads */}
                    <Route path="register-lead" element={<LeadForm />} />
                    <Route path="register-lead/:id" element={<LeadForm />} />

                    {/* 4. Gerenciamento de Usuários (Se Register for usado como form de criação) */}
                    <Route path="user-register" element={<Register />} />
                    
                    {/* 5. Troca de Senha */}
                    <Route path="change-password" element={<ChangePassword />} />

                    {/* 6. Relatórios */}
                    <Route path="reports" element={<ReportsPage />} />

                    {/* 7. Configurações */}
                    <Route path="settings" element={<Configuracoes />} />

                </Route>

                {/* Rota curinga (404) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;