// src/App.jsx - CÓDIGO FINAL COM ROTAS ANINHADAS PARA O LAYOUT FIXO

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

// Componente principal App
function App() {
    return (
        // O AuthProvider deve envolver tudo para que useAuth funcione nas rotas
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> 

                {/* Rota Protegida (com layout fixo) */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard /> {/* Componente de layout com Sidebar e Header */}
                        </ProtectedRoute>
                    }
                >
                    {/* Rotas Aninhadas (Conteúdo do Dashboard/Layout) */}
                    <Route index element={<Navigate to="/dashboard" replace />} /> {/* Rota raiz aponta para dashboard */}

                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="/dashboard" element={<KanbanBoard />} />

                    {/* 2. Busca/Lista de Leads */}
                    <Route path="/leads" element={<LeadSearch />} />

                    {/* 3. Cadastro/Edição de Leads */}
                    <Route path="/register-lead" element={<LeadForm />} />
                    {/* CRÍTICO: Rota para Edição com ID dinâmico */}
                    <Route path="/register-lead/:id" element={<LeadForm />} />

                    {/* 4. Gerenciamento de Usuários */}
                    <Route path="/user-register" element={<Register />} />
                    
                    {/* 5. Troca de Senha */}
                    <Route path="/change-password" element={<ChangePassword />} />

                    {/* 6. Relatórios */}
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* 7. Configurações */}
                    <Route path="/settings" element={<Configuracoes />} />

                </Route>

                {/* Rota curinga (404) - Redireciona para /dashboard se nenhuma rota corresponder */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;