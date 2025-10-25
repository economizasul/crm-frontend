// src/App.jsx - ESTRUTURA CRÍTICA DE ROTAS ANINHADAS

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 

import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 

// Componentes de Layout e Conteúdo
import Dashboard from './Dashboard.jsx'; // O componente de layout (Sidebar + Outlet)
import KanbanBoard from './KanbanBoard.jsx'; // Conteúdo do Dashboard
import LeadSearch from './LeadSearch.jsx'; // Tela de Busca/Lista
import LeadForm from './LeadForm.jsx'; // Cadastro/Edição de Lead

// Componente para proteger rotas (Mantenha o seu código atual, se funcional)
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

// Componente para redirecionar após login (Mantenha o seu código atual, se funcional)
const RedirectAfterLogin = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated && location.pathname === '/login') {
            window.location.href = '/dashboard'; 
        }
    }, [isAuthenticated, location]);

    return null;
};


function App() {
    return (
        <AuthProvider> 
            <Routes>
                {/* Rotas Públicas: Login/Registro */}
                <Route path="/login" element={<><Login /><RedirectAfterLogin /></>} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* GRUPO DE ROTAS PROTEGIDAS/ANINHADAS (Dashboard é o Layout Pai) */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    
                    {/* Rotas Filhas: Renderizadas dentro do <Outlet /> do Dashboard */}
                    
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    <Route path="/leads" element={<LeadSearch />} /> 
                    <Route path="/register-lead" element={<LeadForm />} />
                    
                    {/* Rotas de Rodapé do Sidebar */}
                    <Route path="/reports" element={<div className="text-2xl font-bold">Página de Relatórios (Em breve)</div>} />
                    <Route path="/settings" element={<div className="text-2xl font-bold">Página de Configurações (Em breve)</div>} />

                </Route>
                
                {/* Rota curinga (404) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;