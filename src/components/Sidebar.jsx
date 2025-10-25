// src/components/Sidebar.jsx - CÓDIGO FINAL COM LAYOUT MINIMIZADO/EXPANDÍVEL E BOTÃO DE EXPANSÃO INTERNO

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
        if (window.innerWidth < 768 && toggleMobileSidebar) { 
            toggleMobileSidebar(); 
        }
    };
    
    const handleLogout = () => {
        logout(); 
        navigate('/login', { replace: true }); 
        if (window.innerWidth < 768 && toggleMobileSidebar) {
            toggleMobileSidebar();
        }
        // Não minimiza automaticamente em desktop
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
        <div className={`
            w-full // Garante que o conteúdo ocupe a largura do contêiner externo (Dashboard)
            bg-gray-800 text-white p-6 shadow-xl h-full flex flex-col
            transition-all duration-300 ease-in-out
        `}>
            
            {/* Cabeçalho, Logo e Botão de Fechar (Mobile) */}
            <div className={`
                flex items-center border-b border-indigo-700 pb-4 mb-4
                ${isExpanded ? 'justify-between' : 'justify-center'}
            `}>
                {isExpanded ? (
                    <div className="text-2xl font-bold text-indigo-100">
                        ECONOMIZA SUL
                    </div>
                ) : (
                    <div className="text-xl font-bold text-indigo-100">ES</div> // Ícone ou sigla quando minimizado
                )}

                {/* Botão de Fechar (APENAS MOBILE) */}
                <button 
                    onClick={toggleMobileSidebar} 
                    className="text-indigo-200 hover:text-white md:hidden"
                >
                    <FaTimes size={20} />
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
                        {isExpanded && <span className="whitespace-nowrap">{item.name}</span>} {/* Texto só aparece se expandido */}
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
                        <item.icon className="w-5 h-5" />
                        {isExpanded && <span className="whitespace-nowrap">{item.name}</span>} {/* Texto só aparece se expandido */}
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
                    <FaSignOutAlt className="w-5 h-5" />
                    {isExpanded && <span className="whitespace-nowrap">Sair</span>} {/* Texto só aparece se expandido */}
                </button>
            </div>
            
            {/* 🚨 NOVO BOTÃO DE EXPANSÃO/MINIMIZAÇÃO (APENAS EM DESKTOP) */}
            <div className="hidden md:flex justify-end pt-4">
                <button
                    onClick={toggleExpansion}
                    className="p-2 rounded-full bg-indigo-700 text-white hover:bg-indigo-600 transition duration-200"
                    title={isExpanded ? "Minimizar Menu" : "Expandir Menu"}
                >
                    {isExpanded ? <FaAngleDoubleLeft size={16} /> : <FaAngleDoubleRight size={16} />}
                </button>
            </div>
            
        </div>
    );
};

export default Sidebar;