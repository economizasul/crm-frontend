// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; // Agora usado apenas na rota protegida
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
                {/* CRÍTICO: Rota de Registro Público REMOVIDA. O formulário Register agora é para o Admin. */}
                {/* Se o link no Login.jsx for mantido, ele levará a uma página não encontrada. */}
                {/* <Route path="/register" element={<Register />} /> */}
                
                {/* Rota raiz / redireciona para o Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 🚨 ROTA DE LAYOUT PROTEGIDA: Dashboard é o componente Pai */}
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