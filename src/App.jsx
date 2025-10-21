import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 

// CORREÇÃO: Caminhos ajustados para a raiz do src/
import { AuthProvider, useAuth } from './AuthContext.jsx'; 
import Login from './Login.jsx'; 
import Register from './Register.jsx'; 
import Dashboard from './Dashboard.jsx';
import LeadForm from './LeadForm.jsx';
import LeadSearch from './LeadSearch.jsx';

// Componente ProtectedRoute (O código dele está correto)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isAuthReady } = useAuth();
    
    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                {/* ... (Spinner/Loading) ... */}
                <span>Carregando...</span>
            </div>
        );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider> 
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Rotas Protegidas */}
                <Route 
                    path="/dashboard" 
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                />
                <Route 
                    path="/leads/cadastro" 
                    element={<ProtectedRoute><LeadForm /></ProtectedRoute>} 
                />
                <Route 
                    path="/leads" 
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                />
                <Route
                    path="/search-lead"
                    element={<ProtectedRoute><LeadSearch /></ProtectedRoute>}
                />    
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;