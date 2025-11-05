// src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft, FaLock } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx'; // CRÍTICO: Importar useAuth para acessar o objeto 'user'

// Estilos para os links de navegação
const LinkClass = ({ isActive, isExpanded }) =>
    `w-full flex items-center p-3 rounded-xl transition duration-200
    ${isActive
        ? 'bg-indigo-700 text-white shadow-lg'
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}
    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
    `;

// Recebe 'isExpanded', 'toggleExpansion', 'toggleMobileSidebar' como props
const Sidebar = ({ isExpanded, toggleExpansion, toggleMobileSidebar }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth(); // Desestruturar 'user'

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

    // ⭐️ LOGIC PARA ITENS DE NAVEGAÇÃO CONDICIONAIS ⭐️
    // Permissões do usuário
    const isAdmin = user?.role === 'Admin';
    // Pode ver Relatórios se tiver a permissão específica ou for Admin
    const canSeeReports = user?.relatorios_proprios_only || user?.relatorios_todos || isAdmin;
    // Pode gerenciar usuários apenas se for Admin
    const canManageUsers = isAdmin;
    // Pode acessar Configurações se tiver a permissão específica ou for Admin
    const canAccessSettings = user?.acesso_configuracoes || isAdmin;

    const mainItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt, required: true },
        { name: 'Lista de Leads', path: '/leads', icon: FaSearch, required: true },
        { name: 'Novo Lead', path: '/register-lead', icon: FaUserPlus, required: true },
        // Item condicional: Relatórios
        ...(canSeeReports ? [{ name: 'Relatórios', path: '/reports', icon: FaChartBar, required: true }] : []),
    ];

    const footerItems = [
        // Item condicional: Gerenciamento de Usuários
        ...(canManageUsers ? [{ name: 'Usuários', path: '/user-register', icon: FaLock, required: true }] : []),
        // Item condicional: Configurações
        ...(canAccessSettings ? [{ name: 'Configurações', path: '/settings', icon: FaCogs, required: true }] : []),
        // Trocar Senha (Sempre visível)
        { name: 'Trocar Senha', path: '/change-password', icon: FaLock, required: true }
    ];

    return (
        <div className={`
            h-full flex flex-col bg-indigo-800 text-white transition-all duration-300
            ${isExpanded ? 'w-64' : 'w-20'} p-4 fixed top-0 left-0 z-40
            md:relative md:translate-x-0
        `}>
            {/* Header e Botão de Expansão/Fechamento (para desktop) */}
            <div className={`flex items-center mb-6 pb-4 border-b border-indigo-700 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                {isExpanded && <h1 className="text-2xl font-bold">CRM App</h1>}
                <button
                    onClick={toggleExpansion}
                    className="p-2 rounded-full text-indigo-200 hover:bg-indigo-700 hover:text-white hidden md:block"
                    aria-label={isExpanded ? 'Recolher Menu' : 'Expandir Menu'}
                >
                    {isExpanded ? <FaAngleDoubleLeft className="w-5 h-5" /> : <FaAngleDoubleRight className="w-5 h-5" />}
                </button>
                {/* Botão de Fechar no Mobile */}
                <button
                    onClick={toggleMobileSidebar}
                    className="p-2 rounded-full text-indigo-200 hover:bg-indigo-700 hover:text-white md:hidden"
                    aria-label="Fechar Menu"
                >
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            {/* Links de Navegação Principais */}
            <nav className="flex-1 space-y-2">
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