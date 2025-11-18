// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';

import { AuthProvider, useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Dashboard from './Dashboard.jsx';
import KanbanBoard from './pages/KanbanBoard.jsx';
import LeadSearch from './pages/LeadSearch.jsx';
import LeadForm from './pages/LeadForm.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import Configuracoes from './pages/Configuracoes.jsx';
import FullMap from './components/reports/FullMap.jsx';

// Componente do Botão de Tema (flutuante, bonito e animado)
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-6 right-6 z-50 p-4 rounded-full bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-300"
      aria-label="Alternar tema"
    >
      <motion.div
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {darkMode ? (
          <FaSun className="text-2xl text-yellow-500" />
        ) : (
          <FaMoon className="text-2xl text-indigo-600" />
        )}
      </motion.div>
    </motion.button>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      {children}
      <ThemeToggle />
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<KanbanBoard />} />
          <Route path="leads" element={<LeadSearch />} />
          <Route path="register-lead" element={<LeadForm />} />
          <Route path="register-lead/:id" element={<LeadForm />} />
          <Route path="user-register" element={<Register />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<Configuracoes />} />
          <Route path="full-map" element={<FullMap />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;