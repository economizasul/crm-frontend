// src/components/Sidebar.jsx - CÓDIGO FINAL COM BOTÃO DE EXPANSÃO NO TOPO E NOME DA EMPRESA CONDICIONAL

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Adicionada importação do ícone FaLock para Trocar Senha
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft, FaLock } from 'react-icons/fa'; 
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
    // CRÍTICO: Obtém o objeto 'user' para verificação de permissão (role)
    const { logout, user } = useAuth(); 

    // Função que fecha o menu (principalmente para mobile)
    const handleNavLinkClick = () => {
        if (window.innerWidth < 768 && toggleMobileSidebar) {
            toggleMobileSidebar();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Assume-se que o role do usuário está em user.role e que o valor para Admin é 'admin'
    const isAdmin = user && user.role === 'admin';

    // 1. Links principais de navegação 
    const mainItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
        { name: 'Busca de Leads', path: '/leads', icon: FaSearch },
        { name: 'Cadastrar Lead', path: '/register-lead', icon: FaUserPlus },
        // NOVO: Link de Cadastro de Usuário (APENAS ADMIN)
        ...(isAdmin ? [{ name: 'Cadastrar Usuário', path: '/user-register', icon: FaUserPlus }] : []),
    ];

    // 2. Links de Rodapé
    const footerItems = [
        // Mantido o link de Configurações Gerais
        { name: 'Configurações', path: '/settings', icon: FaCogs },
        // NOVO: Link de Troca de Senha (ADMIN E USUÁRIO)
        { name: 'Trocar Senha', path: '/change-password', icon: FaLock }, 
    ];
    
    return (
        // Container da Sidebar (Mantido)
        <div className={`
            ...
        `}>
            {/* Botão de Fechar no Mobile (Mantido) */}
            <div className="md:hidden p-4 flex justify-end">
                <button onClick={toggleMobileSidebar} className="text-indigo-300 hover:text-white">
                    <FaTimes className="w-6 h-6" />
                </button>
            </div>
            
            {/* Cabeçalho com Logo/Nome da Empresa e Toggle de Expansão (Mantido) */}
            <div className="p-4 flex items-center justify-between">
                {isExpanded && (
                    <h1 className="text-xl font-bold text-white transition-opacity duration-300 whitespace-nowrap">
                        Meu CRM
                    </h1>
                )}
                {/* Botão de expansão/minimização no topo */}
                <button 
                    onClick={toggleExpansion}
                    className={`p-1 rounded-full transition duration-300 ${isExpanded ? 'text-indigo-200 hover:bg-indigo-700' : 'text-white hover:bg-indigo-600'}`}
                >
                    {isExpanded ? (
                        <FaAngleDoubleLeft className="w-5 h-5" />
                    ) : (
                        <FaAngleDoubleRight className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Links Principais (Mantido o loop) */}
            <nav className="flex-grow space-y-2 p-4 pt-0 overflow-y-auto">
                {mainItems.map((item) => (
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

            {/* Links de Rodapé (Mantido o loop) */}
            <div className="mt-auto space-y-2 border-t border-indigo-700 pt-4">
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

                {/* Botão Sair (Mantido) */}
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