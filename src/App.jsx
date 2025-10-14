import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login.jsx'; 
import Register from './Register.jsx';
import LeadForm from './LeadForm.jsx'; 

function App() {
  // Simples verificação de autenticação (verifica se há um token)
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Componente básico do Painel
  const Dashboard = () => {
      const navigate = useNavigate(); // Hook para navegação SPA

      return (
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
                          navigate('/login', { replace: true }); // Usa o hook navigate
                      }}
                      className="mt-6 py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                    >
                      Sair (Logout)
                  </button>
                </div>
        </div>
      );
  };

  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rota Protegida (Uso idiomático do v6) */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />} 
         />
                 {/* NOVO: Rota Protegida para o Cadastro de Leads */}
        <Route 
          path="/leads/cadastro" 
          element={isAuthenticated() ? <LeadForm /> : <Navigate to="/login" replace />} 
          />

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