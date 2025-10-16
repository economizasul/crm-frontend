import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaSearch, FaTachometerAlt, FaRegListAlt, FaUserPlus, FaExchangeAlt, FaCogs, FaSignOutAlt, FaChartBar } from 'react-icons/fa';

// Estilos para os links de navegação
const LinkClass = ({ isActive }) => 
    `w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 justify-start 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

const Sidebar = () => {
    // Menu de navegação
    const navItems = [
        { name: 'Buscar Lead', icon: FaSearch, path: '/search-lead' },
        { name: 'Kanban Leads', icon: FaRegListAlt, path: '/dashboard' },
        { name: 'Cadastrar Lead', icon: FaUserPlus, path: '/register-lead' },
        { name: 'Transferir Lead', icon: FaExchangeAlt, path: '/transfer-lead' },
    ];
    
    // Menu de rodapé/configurações
    const footerItems = [
        { name: 'Relatórios', icon: FaChartBar, path: '/reports' },
        { name: 'Configurações', icon: FaCogs, path: '/settings' },
    ];

    return (
        // Sidebar: largura fixa (w-64), fundo escuro e altura total
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
                    onClick={() => console.log('Saindo...')} // Adicionar lógica de logout real
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