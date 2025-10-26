// src/components/Sidebar.jsx - CÓDIGO FINAL COM BOTÃO DE EXPANSÃO NO TOPO E NOME DA EMPRESA CONDICIONAL

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx'; 

// Estilos para os links de navegação (agora com texto condicional)
const LinkClass = ({ isActive, isExpanded }) => 
    `w-full flex items-center p-3 rounded-xl transition duration-200 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}
    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'} // Alinha itens para centralizar ícones quando minimizado
    `;

// CRÍTICO: Recebe 'isExpanded', 'toggleExpansion', 'toggleMobileSidebar' como props
const Sidebar = ({ isExpanded, toggleExpansion, toggleMobileSidebar }) => { 
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    // Função que fecha o menu (principalmente para mobile)
    const handleNavLinkClick = () => {
        // Fecha o sidebar apenas em telas menores que 'md' (768px)
        if (window.innerWidth < 768 && toggleMobileSidebar) {
            toggleMobileSidebar();
        }
    };
    
    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
        handleNavLinkClick(); // Fecha o sidebar após o logout, se estiver em mobile
    };

    // Menu de navegação (corrigidos os paths para rotas aninhadas)
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
        { name: 'Buscar Leads', path: '/leads', icon: FaSearch },
        { name: 'Cadastrar Lead', path: '/register-lead', icon: FaUserPlus },
    ];

    // Menu de rodapé
    const footerItems = [
        { name: 'Relatórios', path: '/reports', icon: FaChartBar },
        { name: 'Configurações', path: '/settings', icon: FaCogs },
    ];

    return (
        <div className={`flex flex-col bg-indigo-800 text-white shadow-xl h-full p-4 ${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
            
            {/* Header / Logo */}
            <div className={`flex items-center mb-6 h-12 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                {isExpanded && (
                    <div className="text-xl font-bold text-indigo-100 whitespace-nowrap overflow-hidden">
                        ECONOMIZA SUL
                    </div>
                )}
                
                {/* Botão de Toggle (Apenas visível em desktop) */}
                <button 
                    onClick={toggleExpansion} 
                    className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-full transition duration-200 hidden md:block"
                    title={isExpanded ? 'Minimizar Menu' : 'Expandir Menu'}
                >
                    {isExpanded ? <FaAngleDoubleLeft size={16} /> : <FaAngleDoubleRight size={16} />}
                </button>
            </div>
            
            {/* Links Principais */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        // Passa isExpanded para a função LinkClass
                        className={(navData) => LinkClass({ ...navData, isExpanded })}
                        onClick={handleNavLinkClick}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {/* Renderiza o nome do item apenas se expandido */}
                        {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Links de Rodapé */}
            <div className="mt-auto space-y-2 border-t border-indigo-700 pt-4">
                {footerItems.map((item) => (
                    <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className={(navData) => LinkClass({ ...navData, isExpanded })}
                        onClick={handleNavLinkClick}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                    </NavLink>
                ))}

                {/* Botão Sair */}
                <button 
                    onClick={handleLogout} 
                    className={`
                        w-full flex items-center p-3 rounded-xl 
                        text-red-300 hover:bg-indigo-700 hover:text-red-100 transition duration-200 
                        ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
                    `}
                >
                    <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="whitespace-nowrap">Sair</span>}
                </button>
            </div>
            
        </div>
    );
};

export default Sidebar;