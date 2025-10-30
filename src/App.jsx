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
import ReportsDashboard from './components/reports/ReportsDashboard.jsx';

// CORREÇÃO: IMPORTAR Configuracoes
import Configuracoes from './pages/Configuracoes.jsx'; // Ajuste o caminho se necessário

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

// Componente para redirecionar após login
const RedirectAfterLogin = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated && location.pathname === '/login') {
            // Redireciona se já logado
        }
    }, [isAuthenticated, location]); 

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<RedirectAfterLogin />} />
                <Route path="/register" element={<Register />} /> 
                
                {/* Rotas Protegidas */}
                <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<KanbanBoard />} />
                    <Route path="/leads" element={<LeadSearch />} /> 
                    <Route path="/register-lead" element={<LeadForm />} />
                    <Route path="/register-lead/:id" element={<LeadForm />} /> 
                    <Route path="/user-register" element={<Register />} /> 
                    <Route path="/change-password" element={<ChangePassword />} /> 
                    <Route path="/reports" element={<ReportsDashboard />} />
                    
                    {/* CORREÇÃO: APENAS UMA ROTA /settings */}
                    <Route path="/settings" element={<Configuracoes />} />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;