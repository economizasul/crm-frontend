// src/App.jsx 

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import ChangePassword from './ChangePassword.jsx'; // Componente de Mudar Senha

// Componentes de Layout e Conteúdo
import Dashboard from './Dashboard.jsx'; // O layout principal que contém o Sidebar
import KanbanBoard from './KanbanBoard.jsx'; // Componente Kanban (o Dashboard principal)
import LeadSearch from './LeadSearch.jsx'; 
import LeadForm from './LeadForm.jsx';

// ⭐️ ÚNICA MODIFICAÇÃO: Importa a nova página de Relatórios
import ReportsPage from './pages/ReportsPage.jsx'; 
// Importa a página de Configurações (Componente já existente)
import Configuracoes from './pages/Configuracoes.jsx'; 

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

// Componente de Layout (Dashboard com Sidebar)
const MainLayout = () => {
    // Note que o MainLayout é apenas o 'wrapper' que fornece o contexto e o layout fixo (Sidebar/Header)
    return (
        <Dashboard>
            {/* O conteúdo da rota aninhada será renderizado dentro do Dashboard */}
            <Routes>
                {/* ⭐️ RESTAURADO: Rota padrão de index para o Dashboard principal */}
                <Route index element={<KanbanBoard />} /> 
                <Route path="/dashboard" element={<KanbanBoard />} />
                
                {/* 2. Busca/Lista de Leads */}
                <Route path="/leads" element={<LeadSearch />} /> 
                
                {/* 3. Cadastro/Edição de Leads */}
                <Route path="/register-lead" element={<LeadForm />} />
                <Route path="/register-lead/:id" element={<LeadForm />} /> 
                
                {/* ⭐️ NOVO: ROTA DE RELATÓRIOS */}
                <Route path="/reports" element={<ReportsPage />} />
                
                {/* Outras Rotas */}
                <Route path="/user-register" element={<Register />} /> 
                <Route path="/change-password" element={<ChangePassword />} /> 
                <Route path="/settings" element={<Configuracoes />} />
                
            </Routes>
        </Dashboard>
    );
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas Protegidas (MainLayout) */}
                {/* ⭐️ RESTAURADO: Rota curinga que usa o MainLayout para todas as rotas internas */}
                <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
                
                {/* Rota final (Catch-all não estritamente necessário devido ao /* acima) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;