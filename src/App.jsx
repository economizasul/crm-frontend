import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importe seus componentes
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
import LeadForm from './LeadForm.jsx'; 

// Componente ProtectedRoute (PADRÃO V6 CORRIGIDO - Usando 'children')
// Recebe os componentes filhos (<Dashboard />) e decide se os renderiza ou redireciona.
const ProtectedRoute = ({ children }) => {
    // 1. Verifica se o token existe (se o usuário está logado)
    const isAuthenticated = !!localStorage.getItem('token');
    
    // 2. Se não estiver autenticado, redireciona para o login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // 3. Se estiver autenticado, renderiza os componentes filhos
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas Protegidas (Envolvidas pelo ProtectedRoute) */}
                
                {/* Rota do Dashboard (CORRIGIDA) */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                {/* Rotas de Leads */}
                <Route path="/leads/cadastro" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 

                {/* Rota Raiz (Redirecionamento inicial) */}
                <Route 
                    path="/" 
                    element={
                        // Redireciona para o Dashboard se tiver token, ou para o Login
                        !!localStorage.getItem('token') 
                            ? <Navigate to="/dashboard" replace /> 
                            : <Navigate to="/login" replace />
                    } 
                />

                {/* Rota 404 (Redireciona para o Dashboard) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;