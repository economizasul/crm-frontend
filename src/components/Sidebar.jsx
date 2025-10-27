// src/components/Sidebar.jsx - CÓDIGO FINAL COM BOTÃO DE EXPANSÃO NO TOPO E NOME DA EMPRESA CONDICIONAL

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaUserPlus, FaCogs, FaSignOutAlt, FaChartBar, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft, FaPlus } from 'react-icons/fa'; // 🚨 Adicionado FaPlus para 'Cadastrar Lead'
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
    // 🚨 Adicionado 'user' para verificar o role
    const { logout, user } = useAuth(); 
    
    // Lógica para verificar se o usuário é Admin
    const isAdmin = user && user.role === 'admin'; 

    // Função que fecha o menu (principalmente para mobile)
    const handleNavLinkClick = () => {
        if (window.innerWidth < 768 && toggleMobileSidebar) { // 768px é o breakpoint 'md' do Tailwind
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

    // 🚨 NOVO: Definição dos itens de navegação com propriedade de restrição
    const baseNavItems = [
        { name: 'Dashboard', icon: FaTachometerAlt, path: '/dashboard', adminOnly: false },
        { name: 'Buscar Leads', icon: FaSearch, path: '/leads', adminOnly: false },
        { name: 'Cadastrar Lead', icon: FaPlus, path: '/register-lead', adminOnly: false }, 
        // Item RESTRICTO: Apenas para Admin
        { name: 'Cadastrar Usuário', icon: FaUserPlus, path: '/register-user', adminOnly: true }, 
    ];

    const baseFooterItems = [
        { name: 'Configurações', icon: FaCogs, path: '/settings', adminOnly: false },
        { name: 'Relatórios', icon: FaChartBar, path: '/reports', adminOnly: true },
    ];

    // 🚨 FILTRAGEM: O menu só inclui itens que não são adminOnly OU se o usuário for Admin.
    const navItems = baseNavItems.filter(item => !item.adminOnly || isAdmin);
    const footerItems = baseFooterItems.filter(item => !item.adminOnly || isAdmin);


    return (
        // ... (resto do componente Dashboard)
        <div 
            className={`flex flex-col bg-indigo-800 text-white p-6 shadow-xl h-full transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'} relative`}
        >
            {/* Cabeçalho e Logo */}
            <div className="flex justify-between items-center mb-8">
                {isExpanded && (
                    <div className="text-xl font-bold text-indigo-100">
                        ECONOMIZA SUL
                    </div>
                )}
                <button
                    onClick={toggleExpansion}
                    className="p-2 rounded-full text-indigo-200 hover:bg-indigo-700 hover:text-white transition"
                    title={isExpanded ? 'Minimizar Menu' : 'Expandir Menu'}
                >
                    {isExpanded ? <FaAngleDoubleLeft className="w-5 h-5" /> : <FaAngleDoubleRight className="w-5 h-5" />}
                </button>
            </div>


            {/* Links Principais */}
            <nav className="flex-1 space-y-2">
                {/* 🚨 Usa a lista filtrada */}
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
                {/* 🚨 Usa a lista filtrada */}
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