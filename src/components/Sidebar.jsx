// src/components/Sidebar.jsx - CÓDIGO COMPLETO COM TEAL

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx'; 

// Estilos para os links de navegação (agora com texto condicional)
const LinkClass = ({ isActive, isExpanded }) => 
    `w-full flex items-center p-3 rounded-xl transition duration-200 
    ${isActive 
        ? 'bg-teal-700 text-white shadow-lg' // ATIVO: bg-teal-700
        : 'text-teal-200 hover:bg-teal-700 hover:text-white'} // NORMAL/HOVER: text-teal-200, hover:bg-teal-700
    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
    `;

const Sidebar = ({ isExpanded, toggleExpansion, toggleMobileSidebar }) => { 
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    // Fecha o sidebar móvel após um clique no link
    const handleNavLinkClick = () => {
        if (window.innerWidth < 768 && toggleMobileSidebar) {
            toggleMobileSidebar(); 
        }
    };
    
    // Lógica de logout que também fecha o sidebar móvel
    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
        if (window.innerWidth < 768 && toggleMobileSidebar) {
            toggleMobileSidebar();
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
        { name: 'Buscar Leads', path: '/leads', icon: FaSearch },
        { name: 'Cadastrar Lead', path: '/register-lead', icon: FaUserPlus },
    ];

    const footerItems = [
        { name: 'Relatórios', path: '/reports', icon: FaChartBar },
        { name: 'Configurações', path: '/settings', icon: FaCogs },
    ];


    return (
        <div 
            className={`flex flex-col ${isExpanded ? 'w-64' : 'w-20'} bg-teal-800 text-white p-4 shadow-xl h-full transition-all duration-300 ease-in-out`} // FUNDO PRINCIPAL: bg-teal-800
        >
            
            {/* Cabeçalho com Logo/Nome e Botão de Fechar (Mobile) */}
            <div className="flex justify-between items-center mb-6">
                <div className={`text-xl font-bold transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    <span className="text-teal-100">ECONOMIZA SUL</span> {/* TEXTO LOGO: text-teal-100 */}
                </div>
                
                {/* Botão para fechar em mobile */}
                <button 
                    onClick={toggleMobileSidebar}
                    className="md:hidden text-teal-200 hover:text-white"
                >
                    <FaTimes className="w-6 h-6" />
                </button>
            </div>


            {/* Links Principais */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={(navData) => LinkClass({ ...navData, isExpanded })}
                        onClick={handleNavLinkClick}
                    >
                        <item.icon className="w-5 h-5" />
                        {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Links de Rodapé */}
            <div className="mt-auto space-y-2 border-t border-teal-700 pt-4"> {/* BORDA: border-teal-700 */}
                {footerItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={(navData) => LinkClass({ ...navData, isExpanded })}
                        onClick={handleNavLinkClick}
                    >
                        <item.icon className="w-5 h-5" />
                        {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}

                {/* Botão Sair */}
                <button 
                    onClick={handleLogout} 
                    className={`
                        w-full flex items-center p-3 rounded-xl 
                        text-red-300 hover:bg-teal-700 hover:text-red-100 transition duration-200 // HOVER: hover:bg-teal-700
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