// src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft, FaLock } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx'; 

// Estilos para os links de navegação
const LinkClass = ({ isActive, isExpanded }) => 
    `w-full flex items-center p-3 rounded-xl transition duration-200 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}
    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
    `;

const Sidebar = ({ isExpanded, toggleExpansion, toggleMobileSidebar }) => { 
    const navigate = useNavigate();
    const { logout, user } = useAuth(); 

    // Função que fecha o menu (principalmente para mobile)
    const handleNavLinkClick = () => {
        if (window.innerWidth < 768 && toggleMobileSidebar) { 
            toggleMobileSidebar(); 
        }
    };
    
    // Função para logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ⭐️ CORREÇÃO/NOVO: O objeto `user` do AuthContext agora tem as permissões do backend
    const canSeeReports = user && (user.relatorios_proprios_only || user.relatorios_todos || user.role === 'Admin');
    const isAdmin = user && user.role === 'Admin';
    const canAccessSettings = user && user.acesso_configuracoes;

    // 1. Links de Navegação Primária
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
        { name: 'Busca de Leads', path: '/leads', icon: FaSearch },
        // ⭐️ Adiciona a rota de Relatórios, visível se o usuário tiver alguma permissão de relatório
        ...(canSeeReports 
            ? [{ name: 'Relatórios', path: '/reports', icon: FaChartBar }] 
            : []
        ),
        // Adicione outros links primários aqui, se houver
    ];

    // 2. Links de Administração/Rodapé
    const footerItems = [
        // Cadastro de Usuários (Apenas Admin)
        ...(isAdmin 
            ? [{ name: 'Novo Usuário', path: '/user-register', icon: FaUserPlus }] 
            : []
        ),
        // Configurações (Apenas com a permissão específica)
        ...(canAccessSettings
            ? [{ name: 'Configurações', path: '/settings', icon: FaCogs }] 
            : []
        ),
        { name: 'Mudar Senha', path: '/change-password', icon: FaLock },
    ];

    // Se o usuário não está logado, não renderiza nada ou lida com o estado inicial
    if (!user) return null; 

    return (
        <div className={`
            h-full flex flex-col transition-width duration-300 bg-indigo-800 
            ${isExpanded ? 'w-64 p-4' : 'w-20 p-2'}
        `}>
            {/* Header e Botão de Expansão */}
            <div className={`flex items-center mb-6 pb-2 border-b border-indigo-700 
                ${isExpanded ? 'justify-between' : 'justify-center'}`}
            >
                {isExpanded && <span className="text-xl font-bold text-white">CRM Admin</span>}
                <button 
                    onClick={toggleExpansion}
                    className="p-1 rounded-full text-indigo-200 hover:bg-indigo-700 hover:text-white"
                    title={isExpanded ? "Encolher Sidebar" : "Expandir Sidebar"}
                >
                    {isExpanded ? <FaAngleDoubleLeft className="w-5 h-5" /> : <FaAngleDoubleRight className="w-5 h-5" />}
                </button>
            </div>

            {/* Links de Navegação Principal */}
            <nav className="space-y-2">
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