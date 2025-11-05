// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/AuthContext.jsx';
import Login from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import ChangePassword from '@/pages/ChangePassword.jsx';
import Dashboard from '@/components/Dashboard.jsx';
import KanbanBoard from '@/pages/KanbanBoard.jsx';
import LeadSearch from '@/pages/LeadSearch.jsx';
import LeadForm from '@/pages/LeadForm.jsx';
import ReportsPage from '@/pages/ReportsPage.jsx';
import Configuracoes from '@/pages/Configuracoes.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<KanbanBoard />} />
          <Route path="leads" element={<LeadSearch />} />
          <Route path="register-lead" element={<LeadForm />} />
          <Route path="register-lead/:id" element={<LeadForm />} />
          <Route path="user-register" element={<Register />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;