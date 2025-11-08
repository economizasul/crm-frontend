// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaTachometerAlt,
  FaUserPlus,
  FaCogs,
  FaSignOutAlt,
  FaChartBar,
  FaTimes,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
  FaLock
} from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx';

const LinkClass = ({ isActive, isExpanded }) =>
  `w-full flex items-center p-3 rounded-xl transition duration-200
   ${isActive
     ? 'bg-indigo-700 text-white shadow-lg'
     : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}
   ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`;

const Sidebar = ({ isExpanded, toggleExpansion, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768 && toggleMobileSidebar) {
      toggleMobileSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const canManageUsers = isAdmin;
  const canAccessSettings = user?.acesso_configuracoes || isAdmin;

  const mainItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
    { name: 'Lista de Leads', path: '/leads', icon: FaSearch },
    { name: 'Novo Lead', path: '/register-lead', icon: FaUserPlus },
    // RELATÓRIOS FORÇADO A APARECER PARA TODOS
    { name: 'Relatórios', path: '/reports', icon: FaChartBar }
  ];

  const footerItems = [
    ...(canManageUsers ? [{ name: 'Usuários', path: '/user-register', icon: FaLock }] : []),
    ...(canAccessSettings ? [{ name: 'Configurações', path: '/settings', icon: FaCogs }] : []),
    { name: 'Trocar Senha', path: '/change-password', icon: FaLock }
  ];

  return (
    <div
      className={`
        h-full flex flex-col bg-indigo-800 text-white transition-all duration-300
        ${isExpanded ? 'w-64' : 'w-20'} p-4 fixed top-0 left-0 z-40
        md:relative md:translate-x-0
      `}
    >
      <div className={`flex items-center mb-6 pb-4 border-b border-indigo-700 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && <h1 className="text-2xl font-bold">CRM App</h1>}
        <button
          onClick={toggleExpansion}
          className="p-2 rounded-full text-indigo-200 hover:bg-indigo-700 hover:text-white hidden md:block"
          aria-label={isExpanded ? 'Recolher Menu' : 'Expandir Menu'}
        >
          {isExpanded ? <FaAngleDoubleLeft className="w-5 h-5" /> : <FaAngleDoubleRight className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-full text-indigo-200 hover:bg-indigo-700 hover:text-white md:hidden"
          aria-label="Fechar Menu"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {mainItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => LinkClass({ isActive, isExpanded })}
            onClick={handleNavLinkClick}
          >
            <item.icon className="w-5 h-5" />
            {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-indigo-700 pt-4">
        {footerItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => LinkClass({ isActive, isExpanded })}
            onClick={handleNavLinkClick}
          >
            <item.icon className="w-5 h-5" />
            {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center p-3 rounded-xl
            text-red-300 hover:bg-indigo-700 hover:text-red-100 transition duration-200
            ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
          `}
        >
          <FaSignOutAlt className="w-5 h-5" />
          {isExpanded && <span className="whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;