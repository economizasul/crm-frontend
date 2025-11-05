// src/App.jsx - CÓDIGO FINAL COM ROTAS ANINHADAS PARA O LAYOUT FIXO

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import ChangePassword from './ChangePassword.jsx';

// Componentes de Layout e Conteúdo
import Dashboard from './Dashboard.jsx'; 
import KanbanBoard from './KanbanBoard.jsx'; 
import LeadSearch from './LeadSearch.jsx'; 
import LeadForm from './LeadForm.jsx';

// ⭐️ NOVO/CORRIGIDO: Importa a página de Relatórios
import ReportsPage from './pages/ReportsPage.jsx'; 

// Importa a página de Configurações
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
    // Aqui você deve ter o estado e a lógica para o Dashboard
    // Exemplo: const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    return (
        <Dashboard>
            {/* O conteúdo da rota aninhada será renderizado aqui */}
            <Routes>
                {/* Rotas Protegidas */}
                {/* 1. Dashboard Principal (Kanban Board) */}
                <Route index element={<KanbanBoard />} /> {/* Rota padrão para /dashboard */}
                <Route path="/dashboard" element={<KanbanBoard />} />
                
                {/* 2. Busca/Lista de Leads */}
                <Route path="/leads" element={<LeadSearch />} /> 
                
                {/* 3. Cadastro/Edição de Leads */}
                <Route path="/register-lead" element={<LeadForm />} />
                <Route path="/register-lead/:id" element={<LeadForm />} /> 
                
                {/* ⭐️ ROTA DE RELATÓRIOS (USANDO ReportsPage) */}
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
                
                {/* Rotas Protegidas (Layout Principal) */}
                <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
                
                {/* Rota curinga (404) - Se nenhuma rota for encontrada, redireciona para o login ou dashboard */}
                {/* A rota "/*" acima já cobre isso, mas para garantir o catch-all: */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;