// Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import { FaSearch, FaTachometerAlt, FaRegListAlt, FaUserPlus, FaExchangeAlt, FaCogs, FaSignOutAlt, FaChartBar } from 'react-icons/fa';

// IMPORTAÇÃO CRÍTICA: Importar o useAuth
import { useAuth } from './AuthContext.jsx'; 

// Estilos para os links de navegação
const LinkClass = ({ isActive }) => 
    `w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 justify-start 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

const Sidebar = () => {
    const navigate = useNavigate();
    // USANDO O HOOK DE AUTENTICAÇÃO
    const { logout } = useAuth(); 

    // Lógica para sair: Limpa o token via Contexto e navega para a tela de login
    const handleLogout = () => {
        logout(); // CHAMA O LOGOUT DEFINIDO NO AUTHCONTEXT (Limpa localStorage e estado)
        navigate('/login', { replace: true }); 
    };
    
    // Menu de navegação
    const navItems = [
        { name: 'Buscar Lead', icon: FaSearch, path: '/search-lead' },
        { name: 'Kanban Leads', icon: FaChartBar, path: '/dashboard' },
        { name: 'Cadastro Lead', icon: FaUserPlus, path: '/leads/cadastro' },
    ];

    // Itens de rodapé (Configurações, etc.)
    const footerItems = [
        { name: 'Configurações', icon: FaCogs, path: '/settings' },
    ];

    return (
        <div className="flex flex-col w-64 bg-indigo-800 text-white p-6 shadow-xl h-full">
            {/* Logo */}
            <div className="text-2xl font-bold mb-8 text-center text-indigo-100">
                ECONOMIZA SUL
            </div>

            {/* Links Principais */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink key={item.name} to={item.path} className={LinkClass}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Links de Rodapé */}
            <div className="mt-auto space-y-2 border-t border-indigo-700 pt-4">
                {footerItems.map((item) => (
                    <NavLink key={item.name} to={item.path} className={LinkClass}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}

                {/* Botão Sair */}
                <button 
                    // CHAMADA DA FUNÇÃO handleLogout
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-300 hover:bg-indigo-700 hover:text-red-100 transition duration-200 justify-start"
                >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;