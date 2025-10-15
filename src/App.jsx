import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // ADICIONEI Router e usei a desestruturação
// O BrowserRouter deve envolver o App, mas se você não tem ele aqui, pode estar no seu main.jsx/main.js
// Se estiver no main.jsx/main.js, remova-o daqui:

// IMPORTANTE: Se o seu <Routes> funciona sem o <Router> aqui, 
// significa que o <Router> está no seu main.jsx.

// Importe seus componentes
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
import LeadForm from './LeadForm.jsx'; 

// Componente ProtectedRoute (Mantido na sintaxe antiga que funciona para você)
const ProtectedRoute = ({ component: Component }) => {
    const isAuthenticated = !!localStorage.getItem('token');
 
    // Usa a sintaxe v5 que sua base de código parece favorecer para funcionar
    return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        // ATENÇÃO: Se os textos indesejados estavam aqui, foram removidos.
        // Se a sua aplicação usa <Router> no main.jsx, esta versão deve funcionar:
        <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rota de Cadastro */}
            <Route path="/register" element={<Register />} />
            
            {/* Rota do Dashboard (Protegida) */}
            {/* Mantemos sua sintaxe original que funciona para evitar tela vazia */}
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
            
            {/* Rotas de Leads (Exemplo) */}
            <Route path="/leads/cadastro" element={<ProtectedRoute component={LeadForm} />} />
            <Route path="/leads" element={<ProtectedRoute component={Dashboard} />} />

            {/* Rota Raiz (Redirecionamento para o Login) */}
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;