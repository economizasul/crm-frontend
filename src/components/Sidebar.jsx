// src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    // CORREÇÃO: Obtém o objeto 'user' do contexto de autenticação
    const { logout, user } = useAuth(); 

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
    };

    // CRÍTICO: Assume-se que o role do usuário está em user.role e que o valor para Admin é 'admin'
    const isAdmin = user && user.role === 'admin';

    // 1. Links principais de navegação 
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt }, 
        { name: 'Buscar Lead', path: '/leads', icon: FaSearch }, 
        { name: 'Cadastrar Lead', path: '/register-lead', icon: FaUserPlus },
        // NOVO/CORRIGIDO: Link de Cadastro de Usuário (APENAS ADMIN)
        ...(isAdmin ? [{ name: 'Cadastrar Usuário', path: '/user-register', icon: FaUserPlus }] : []),
    ];
    
    // 2. Links de Rodapé
    // Inclui a função Troca de Senha nas Configurações
    const footerItems = [
        { name: 'Relatórios', path: '/reports', icon: FaChartBar },
        { name: 'Configurações', path: '/settings', icon: FaCogs },
        // NOVO: Link de Troca de Senha (ADMIN E USUÁRIO)
        { name: 'Trocar Senha', path: '/change-password', icon: FaLock },
    ];

    return (
        <div className={`
            w-full
            bg-gray-800 text-white p-4 shadow-xl h-full flex flex-col
            transition-all duration-300 ease-in-out
        `}>
            
            {/* 🚨 NOVO CABEÇALHO COM BOTÃO DE EXPANSÃO NO TOPO */}
            <div className={`
                flex items-center border-b border-indigo-700 pb-3 mb-4
                ${isExpanded ? 'justify-between' : 'justify-center'}
            `}>
                {/* 1. Logo/Título (Apenas se expandido ou se for mobile) */}
                {isExpanded ? (
                    <div className="text-xl font-bold text-indigo-100 flex-1">
                        ECONOMIZA SUL
                    </div>
                ) : (
                    // Vazio ou um ícone simples quando minimizado
                    <div className="text-xl font-bold text-indigo-100 p-2">
                        {/* Deixado vazio para um look mais clean quando minimizado */}
                    </div>
                )}

                {/* 2. Botão de Toggle (APENAS DESKTOP) */}
                <button
                    onClick={toggleExpansion}
                    className="hidden md:block p-1 rounded-full bg-indigo-700 text-white hover:bg-indigo-600 transition duration-200 ml-auto"
                    title={isExpanded ? "Minimizar Menu" : "Expandir Menu"}
                >
                    {isExpanded ? <FaAngleDoubleLeft size={16} /> : <FaAngleDoubleRight size={16} />}
                </button>
                
                {/* 3. Botão de Fechar (APENAS MOBILE) */}
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
                        <item.icon className="w-5 h-5" />
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
                    <FaSignOutAlt className="w-5 h-5" />
                    {isExpanded && <span className="whitespace-nowrap">Sair</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;