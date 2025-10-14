import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx'; // Componente de Login (CORRIGIDO: Voltando para .jsx)
import Register from './Register.jsx'; // Componente de Registro (CORRIGIDO: Voltando para .jsx)

function App() {
  // Simples verificação de autenticação (verifica se há um token)
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Componente de Rota Protegida para o Dashboard
  const ProtectedRoute = ({ element: Element, ...rest }) => {
    // Se não estiver autenticado, redireciona para o login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    // Se estiver autenticado, renderiza o elemento
    return <Element {...rest} />;
  };

  // Componente básico do Painel
  const Dashboard = () => (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
          <div className="p-8 bg-white rounded-xl shadow-2xl text-center">
              <h1 className="text-4xl font-extrabold text-indigo-800 mb-4">
                  Bem-vindo ao Dashboard!
              </h1>
              <p className="text-gray-600">
                  Você está logado.
              </p>
              <button 
                  onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/login'; // Força o refresh e redireciona
                  }}
                  className="mt-6 py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
              >
                  Sair (Logout)
              </button>
          </div>
      </div>
  );

  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rota Protegida */}
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />

        {/* Redirecionamento padrão para o dashboard (se logado) ou login (se deslogado) */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
        
        {/* Tratar rotas não encontradas */}
        <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-4xl font-bold text-gray-700">404 - Página Não Encontrada</h1>
            </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
