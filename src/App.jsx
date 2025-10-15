import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
import LeadForm from './LeadForm.jsx'; 

// Componente ProtectedRoute: Garante que apenas usuários logados acessem a rota.
// É essencial que este componente exista no seu projeto.
const ProtectedRoute = ({ component: Component }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    
    // Se autenticado, renderiza o componente. Caso contrário, redireciona para o login.
    return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        // O <Router> DEVE ENVOLVER TUDO, mas sem nenhum elemento HTML ou texto literal aqui.
        <Router>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas Protegidas (Usando o ProtectedRoute) */}
                
                {/* Rota do Dashboard (A página principal logada) */}
                <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
                
                {/* Rotas de Leads */}
                <Route path="/leads/cadastro" element={<ProtectedRoute component={LeadForm} />} />
                <Route path="/leads" element={<ProtectedRoute component={Dashboard} />} /> 

                {/* Rota Raiz e Rota 404 */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;