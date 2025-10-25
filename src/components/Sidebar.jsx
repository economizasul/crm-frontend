// Sidebar.jsx - CÓDIGO FINAL E REVISADO (Com toggleSidebar)

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx'; 

// Estilos para os links de navegação
const LinkClass = ({ isActive }) => 
    `w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 justify-start 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

// CRÍTICO: Recebe 'toggleSidebar' como propriedade
const Sidebar = ({ toggleSidebar }) => { 
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    // Função que fecha o menu após o clique (em modo móvel)
    const handleNavLinkClick = () => {
        if (toggleSidebar) {
            toggleSidebar(); 
        }
    };
    
    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
        if (toggleSidebar) {
            toggleSidebar();
        }
    };

    // Menu de navegação
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt }, 
        { name: 'Buscar Lead', path: '/leads', icon: FaSearch }, 
        { name: 'Cadastrar', path: '/register-lead', icon: FaUserPlus },
    ];
    
    // Links de Rodapé
    const footerItems = [
        { name: 'Relatórios', path: '/reports', icon: FaChartBar },
        { name: 'Configurações', path: '/settings', icon: FaCogs },
    ];

    return (
        <div className="w-64 bg-gray-800 text-white p-6 shadow-xl h-full flex flex-col">
            
            <div className="flex justify-between items-center border-b border-indigo-700 pb-4 mb-4">
                <div className="text-2xl font-bold text-indigo-100">
                    ECONOMIZA SUL
                </div>
                {/* Botão de Fechar: Visível apenas em mobile e usa a função toggleSidebar */}
                <button 
                    onClick={toggleSidebar} 
                    className="text-indigo-200 hover:text-white md:hidden"
                >
                    <FaTimes size={20} />
                </button>
            </div>
            
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={LinkClass}
                        onClick={handleNavLinkClick} // 🚨 USA A FUNÇÃO DE FECHAMENTO
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-indigo-700 pt-4">
                {footerItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={LinkClass}
                        onClick={handleNavLinkClick} // 🚨 USA A FUNÇÃO DE FECHAMENTO
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}

                <button 
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