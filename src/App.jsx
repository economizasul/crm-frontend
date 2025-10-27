// src/App.jsx - CÓDIGO FINAL COM ROTAS ANINHADAS PARA O LAYOUT FIXO

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 

// Componentes de Layout e Conteúdo (Novas importações)
import Dashboard from './Dashboard.jsx'; // O componente de layout (Sidebar + Outlet)
import KanbanBoard from './KanbanBoard.jsx'; // O conteúdo do Dashboard
import LeadSearch from './LeadSearch.jsx'; // Tela de Busca/Lista
import LeadForm from './LeadForm.jsx'; // Cadastro ou Edição de Lead (antigo /leads/cadastro)

// Componente para proteger rotas - AGORA COM VERIFICAÇÃO DE ROLE (adminOnly)
const ProtectedRoute = ({ children, adminOnly = false }) => { // 🚨 Adicionado 'adminOnly'
    // 🚨 Certifique-se de que useAuth retorna o objeto 'user' com a 'role'
    const { isAuthenticated, isAuthReady, user } = useAuth();
    
    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span>Carregando...</span>
            </div>
        );
    }
    
    // Se não estiver autenticado, redireciona para o login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // NOVO: Se adminOnly for true e o usuário não for Admin, redireciona.
    if (adminOnly && (!user || user.role !== 'admin')) {
        return <Navigate to="/dashboard" replace />;
    }

    // Renderiza o componente
    return children;
};

// Componente para redirecionar após login (Mantido do seu código)
const RedirectAfterLogin = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated && location.pathname === '/login') {
            // Usa navigate em vez de window.location.href para SPA
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
                
                {/* 🚨 REMOVIDO a rota /register pública. Redireciona para o login caso alguém tente acessar. */}
                <Route path="/register" element={<Navigate to="/login" replace />} />

                {/* 🚨 NOVO: Rota de Cadastro de Usuário PROTEGIDA (Admin-only) */}
                <Route path="/register-user" element={<ProtectedRoute adminOnly={true}><Register /></ProtectedRoute>} /> 

                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Rotas Protegidas (Layout Principal: Dashboard com Sidebar e Conteúdo Aninhado) */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    {/* Rotas Filhas: Renderizadas dentro do <Outlet /> do Dashboard */}
                    
                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    
                    {/* 2. Busca/Lista de Leads (Corrigido para /leads, conforme o Sidebar) */}
                    <Route path="/leads" element={<LeadSearch />} /> 
                    
                    {/* 3. Cadastro/Edição de Leads (Corrigido para /register-lead, conforme o Sidebar) */}
                    <Route path="/register-lead" element={<LeadForm />} />
                    
                    {/* Rotas de Rodapé (Ex: /settings, /reports) */}
                    {/* Adicione rotas de rodapé aqui conforme necessário, o ProtectedRoute padrão já as protege */}
                    <Route path="/settings" element={<div>Página de Configurações</div>} />
                    <Route path="/reports" element={<div>Página de Relatórios</div>} />

                </Route>
                
                {/* Rota curinga (404) - Se nenhuma rota aninhada ou pública for encontrada */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;S