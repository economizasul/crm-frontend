import React from 'react';
// IMPORTANTE: Assumimos que o BrowserRouter está sendo usado em seu main.jsx/main.js
import { Routes, Route, Navigate } from 'react-router-dom'; 

// Importe o Provedor e o Hook de Autenticação
// CORREÇÃO: Adicionada a extensão .jsx
import { AuthProvider, useAuth } from './context/AuthContext.jsx'; 

// Importe seus componentes de página
// CORREÇÃO: Adicionada a extensão .jsx
import Login from './pages/Login.jsx'; 
import Register from './pages/Register.jsx'; 
import Dashboard from './pages/Dashboard.jsx';
import LeadForm from './pages/LeadForm.jsx'; 

/**
 * Componente que protege rotas.
 * Ele usa o estado global de autenticação fornecido pelo useAuth.
 * @param {object} children - O componente filho a ser renderizado se autenticado.
 */
const ProtectedRoute = ({ children }) => {
    // Pega o estado de autenticação do contexto
    const { isAuthenticated, isAuthReady } = useAuth();
    
    // Mostra um spinner ou tela de carregamento enquanto o AuthContext verifica o token inicial
    if (!isAuthReady) {
        // Estilização simples para o carregamento. 
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center space-x-2 text-indigo-600">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Carregando...</span>
                </div>
            </div>
        );
    }

    // Se autenticado, renderiza os filhos (o componente de destino, ex: <Dashboard />)
    // Se NÃO autenticado, redireciona para a página de Login
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        // 🛑 CRÍTICO: Envolver toda a aplicação (ou a seção que precisa de auth) com o AuthProvider
        <AuthProvider> 
            <Routes>
                {/* Rota de Login */}
                <Route path="/login" element={<Login />} />
                
                {/* Rota de Cadastro */}
                <Route path="/register" element={<Register />} />
                
                {/* Rota Raiz (Redirecionamento para o Login) */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* ROTAS PROTEGIDAS */}
                
                {/* Rota do Dashboard (Protegida) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Rotas de Leads (Cadastro - Protegida) */}
                <Route 
                    path="/leads/cadastro" 
                    element={
                        <ProtectedRoute>
                            <LeadForm />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Rotas de Leads (Listagem - Assumimos ser o Dashboard) */}
                <Route 
                    path="/leads" 
                    element={
                        <ProtectedRoute>
                            <Dashboard /> {/* Ou um componente de listagem de leads, se for diferente */}
                        </ProtectedRoute>
                    } 
                />
                
                {/* Opcional: Rota para tratar caminhos não encontrados (404) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
        </AuthProvider>
    );
}

export default App;
