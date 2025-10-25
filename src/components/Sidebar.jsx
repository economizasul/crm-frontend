// src/components/Sidebar.jsx - CÓDIGO FINAL COM CORES AJUSTADAS PARA O TEMA VERDE

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx'; 

// Estilos para os links de navegação (agora com texto condicional)
const LinkClass = ({ isActive, isExpanded }) => 
    `w-full flex items-center p-3 rounded-xl transition duration-200 
    ${isActive 
        ? 'bg-green-700 text-white shadow-lg' // AJUSTE DE COR: indigo-700 -> green-700
        : 'text-green-200 hover:bg-green-700 hover:text-white'} // AJUSTE DE COR: indigo-200/700 -> green-200/700
    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'} // Alinha itens para centralizar ícones quando minimizado
    `;

// CRÍTICO: Recebe 'isExpanded', 'toggleExpansion', 'toggleMobileSidebar' como props
const Sidebar = ({ isExpanded, toggleExpansion, toggleMobileSidebar }) => { 
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    // Função que fecha o menu (principalmente para mobile)
    const handleNavLinkClick = () => {
        if (window.innerWidth < 768 && toggleMobileSidebar) { // Fecha apenas em mobile
            toggleMobileSidebar();
        }
    };
    
    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
        if (window.innerWidth < 768 && toggleMobileSidebar) {
            toggleMobileSidebar();
        }
    };

    // Menu de navegação
    const navItems = [
        { name: 'Dashboard (Kanban)', icon: FaTachometerAlt, path: '/dashboard' }, 
        { name: 'Buscar Leads', icon: FaSearch, path: '/leads' }, 
        { name: 'Cadastrar Lead', icon: FaUserPlus, path: '/register-lead' }, 
    ];

    // Links de rodapé
    const footerItems = [
        { name: 'Relatórios', icon: FaChartBar, path: '/reports' },
        { name: 'Configurações', icon: FaCogs, path: '/settings' },
    ];

    return (
        // NOVO BACKGROUND: Verde 900
        <div className="flex flex-col bg-green-900 text-white shadow-xl h-full p-2">
            
            {/* Header com Nome/Logo e Botão de Expansão */}
            <div className={`flex items-center p-4 border-b border-green-700 mb-4 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                
                {isExpanded && (
                    // AJUSTE DE COR: indigo-100 -> green-100
                    <div className="text-xl font-bold text-green-100 whitespace-nowrap">
                        ECONOMIZA SUL
                    </div>
                )}
            </div>

            {/* Links Principais */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
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
            {/* BORDA DE DIVISÃO: indigo-700 -> green-700 */}
            <div className="mt-auto space-y-2 border-t border-green-700 pt-4">
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
                        text-red-300 hover:bg-green-700 hover:text-red-100 transition duration-200 // AJUSTE DE HOVER: indigo-700 -> green-700
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