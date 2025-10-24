// Sidebar.jsx - AJUSTADO PARA SER CONTROLADO PELO DASHBOARD

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaRegListAlt, FaUserPlus, FaExchangeAlt, FaCogs, FaSignOutAlt, FaChartBar, FaTimes } from 'react-icons/fa';
// CORREÇÃO CRÍTICA DO CAMINHO: '../AuthContext.jsx' para subir de src/components para src/
import { useAuth } from '../AuthContext.jsx'; 

// Estilos para os links de navegação (mantidos)
const LinkClass = ({ isActive }) => 
    `w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 justify-start \r\n    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

// O componente agora recebe 'toggleSidebar' como propriedade
const Sidebar = ({ toggleSidebar }) => { 
    const navigate = useNavigate();
    const { logout } = useAuth(); 

    // Lógica para sair: Limpa o token via Contexto e navega para a tela de login
    const handleLogout = () => {
        logout(); // CHAMA O LOGOUT DEFINIDO NO AUTHCONTEXT (limpa localStorage e estado)
        navigate('/login', { replace: true }); 
    };
    
    // Menu de navegação (corrigido o path de Buscar Lead)
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt }, // Seu Kanban
        { name: 'Buscar Lead', path: '/leads', icon: FaSearch }, // Sua rota de busca
        { name: 'Cadastrar', path: '/register-lead', icon: FaUserPlus },
    ];
    
    // Links de Rodapé
    const footerItems = [
        { name: 'Relatórios', path: '/reports', icon: FaChartBar },
        { name: 'Configurações', path: '/settings', icon: FaCogs },
    ];

    return (
        // A largura do sidebar é de 64 (256px) para ser compacta
        <div className="w-64 bg-gray-800 text-white p-6 shadow-xl h-full flex flex-col">
            
            {/* Cabeçalho, Logo e Botão de Fechar */}
            <div className="flex justify-between items-center border-b border-indigo-700 pb-4 mb-4">
                <div className="text-2xl font-bold text-indigo-100">
                    ECONOMIZA SUL
                </div>
                {/* Botão de Fechar: Apenas visível em telas pequenas (< md) */}
                <button 
                    onClick={toggleSidebar} 
                    className="text-indigo-200 hover:text-white md:hidden"
                >
                    <FaTimes size={20} />
                </button>
            </div>
            
            {/* Links Principais */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink key={item.name} to={item.path} className={LinkClass}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Links de Rodapé */}
            <div className="mt-auto space-y-2 border-t border-indigo-700 pt-4">
                {footerItems.map((item) => (
                    <NavLink key={item.name} to={item.path} className={LinkClass}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}

                {/* Botão Sair */}
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