import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // 🚨 IMPORTAÇÃO DO useNavigate
import { FaSearch, FaTachometerAlt, FaRegListAlt, FaUserPlus, FaExchangeAlt, FaCogs, FaSignOutAlt, FaChartBar } from 'react-icons/fa';

// Estilos para os links de navegação
const LinkClass = ({ isActive }) => 
    `w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 justify-start 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

const Sidebar = () => {
    const navigate = useNavigate(); // 🚨 INICIALIZAÇÃO DO HOOK DE NAVEGAÇÃO

    // Lógica para sair: Limpa o token e navega para a tela de login
    const handleLogout = () => {
        // 1. Limpa qualquer token de autenticação ou dados do usuário no localStorage
        localStorage.removeItem('userToken'); 
        localStorage.removeItem('userData');
        
        // 2. Redireciona para a tela de login
        navigate('/login'); 
    };
    
    // Menu de navegação (mantido)
    const navItems = [
        { name: 'Buscar Lead', icon: FaSearch, path: '/search-lead' },
        { name: 'Kanban Leads', icon: FaRegListAlt, path: '/dashboard' },
        { name: 'Cadastrar Lead', icon: FaUserPlus, path: '/register-lead' },
        { name: 'Transferir Lead', icon: FaExchangeAlt, path: '/transferir-lead' },
    ];
    
    // Menu de rodapé/configurações (mantido)
    const footerItems = [
        { name: 'Relatórios', icon: FaChartBar, path: '/reports' },
        { name: 'Configurações', icon: FaCogs, path: '/settings' },
    ];

    return (
        <div className="w-64 flex flex-col bg-indigo-800 text-white h-full p-4 shadow-xl">
            
            {/* Título Principal */}
            <div className="text-2xl font-bold mb-8 text-center text-indigo-100">
                ECONOMIZA SUL
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
                    // 🚨 CHAMADA DA FUNÇÃO handleLogout
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