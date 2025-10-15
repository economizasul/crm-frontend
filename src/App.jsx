import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importe seus componentes
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
import LeadForm from './LeadForm.jsx'; // Usado para o cadastro de leads

// Componente ProtectedRoute: Garante que apenas usuários logados acessem a rota.
const ProtectedRoute = ({ element: Element }) => {
    // Verifica se o token existe no Local Storage
    const isAuthenticated = !!localStorage.getItem('token');
    
    // Se autenticado, renderiza o componente. Caso contrário, redireciona para o login.
    return isAuthenticated ? <Element /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        // O Router DEVE ENVOLVER TUDO, mas sem textos ou elementos de UI aqui.
        <Router>
            <Routes>
                {/* Rota de Login */}
                <Route path="/login" element={<Login />} />
                
                {/* Rota de Cadastro */}
                <Route path="/register" element={<Register />} />
                
                {/* Rotas Protegidas (Apenas para usuários logados) */}
                
                {/* Rota do Dashboard (Root da aplicação logada) */}
                <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
                
                {/* Rotas de Leads */}
                <Route path="/leads/cadastro" element={<ProtectedRoute element={LeadForm} />} />
                <Route path="/leads" element={<ProtectedRoute element={Dashboard} />} /> {/* Exibe todos os leads no Dashboard */}
                {/* TODO: Rota de detalhes do Lead: <Route path="/leads/:id" element={<ProtectedRoute component={LeadDetails} />} /> */}

                {/* Rota Raiz (Redirecionamento inicial para o Login) */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Rota 404 (Qualquer outra rota, redireciona para o login ou dashboard) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
        </Router>
    );
}

export default App;