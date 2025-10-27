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
            // Usa navigate em vez de window.location.href para ser mais "React-friendly"
            // Se precisar de um refresh completo, mantenha window.location.href
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
                
                {/* Rota raiz / redireciona para o Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 🚨 ROTA DE LAYOUT PROTEGIDA: Dashboard é o componente Pai */}
                {/* O elemento ProtectedRoute aplica o guarda. O elemento Dashboard fornece o layout (Sidebar + Outlet) */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    {/* Rotas Filhas: Renderizadas dentro do <Outlet /> do Dashboard */}
                    
                    {/* 1. Dashboard Principal (Kanban Board) */}
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    
                    {/* 2. Busca/Lista de Leads (Corrigido para /leads, conforme o Sidebar) */}
                    <Route path="/leads" element={<LeadSearch />} /> 
                    
                    {/* 3. Cadastro/Edição de Leads (Corrigido para /register-lead, conforme o Sidebar) */}
                    <Route path="/register-lead" element={<LeadForm />} />
                    
                    {/* Adicione aqui rotas de rodapé do Sidebar (/reports, /settings) se existirem */}
                    {/* Exemplo: */}
                    {/* <Route path="/reports" element={<div>Página de Relatórios</div>} /> */}
                    {/* <Route path="/settings" element={<div>Página de Configurações</div>} /> */}

                </Route>
                
                {/* Rota curinga (404) - Se nenhuma rota aninhada ou pública for encontrada */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;