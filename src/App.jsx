import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importe seus componentes
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
// Importe o Sidebar (se for usado fora do Dashboard)
import LeadForm from './LeadForm.jsx'; // Se for um modal, não precisa estar aqui

// Componente ProtectedRoute (Ajuste o código, pois ele não foi enviado, mas é essencial)
const ProtectedRoute = ({ component: Component }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    
    return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rota de Cadastro */}
            <Route path="/register" element={<Register />} />
            
            {/* Rota do Dashboard (Protegida) */}
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
            
            {/* Rotas de Leads (Exemplo) */}
            <Route path="/leads/cadastro" element={<ProtectedRoute component={LeadForm} />} />
            <Route path="/leads" element={<ProtectedRoute component={Dashboard} />} />

            {/* Rota Raiz (Redirecionamento para o Login) */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rota 404 (Opcional) */}
            {/* Se houver um componente NotFound, adicione aqui */}
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
}

export default App;