import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importe seus componentes
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
import LeadForm from './LeadForm.jsx'; 

// Componente ProtectedRoute (CORRIGIDO)
// Agora ele recebe o elemento React a ser renderizado (Element)
const ProtectedRoute = ({ element }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    
    // Retorna o elemento se autenticado, ou redireciona para o login
    return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas Protegidas (Usando o ProtectedRoute CORRIGIDO) */}
                
                {/* Rota do Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                
                {/* Rotas de Leads */}
                <Route path="/leads/cadastro" element={<ProtectedRoute element={<LeadForm />} />} />
                <Route path="/leads" element={<ProtectedRoute element={<Dashboard />} />} /> 

                {/* Rota Raiz (Redirecionamento inicial para o Dashboard se logado, ou Login) */}
                {/* Nota: Vamos redirecionar para o dashboard. O ProtectedRoute fará o resto. */}
                <Route 
                    path="/" 
                    element={
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