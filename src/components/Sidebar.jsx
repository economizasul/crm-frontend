import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, LogOut, X } from 'lucide-react';

// Define o estilo de link ativo e inativo (Tailwind)
const LinkClass = ({ isActive }) => 
    `flex items-center space-x-3 p-3 rounded-xl transition duration-200 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

const Sidebar = ({ handleLogout, isSidebarOpen, setIsSidebarOpen }) => {
    
    // Links de navegação principais
    const navLinks = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Kanban Leads", path: "/leads/kanban", icon: Users },
        { name: "Cadastrar Lead", path: "/leads/cadastro", icon: Zap },
    ];

    return (
        <>
            {/* Overlay para Mobile (fecha a sidebar ao clicar fora) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Principal (Design fixo e elegante) */}
            <aside 
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 transition-transform duration-300 w-64 bg-indigo-900 text-white z-50 shadow-2xl flex flex-col`}
            >
                
                {/* Cabeçalho/Logo */}
                <div className="p-6 border-b border-indigo-700 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold tracking-wider">
                        ECONOMIZA SUL CRM
                    </h1>
                    {/* Botão de Fechar no Mobile */}
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-white p-1 rounded-full hover:bg-indigo-700 md:hidden"
                        aria-label="Fechar Menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Links de Navegação */}
                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={LinkClass}
                            onClick={() => setIsSidebarOpen(false)} // Fecha no mobile após o clique
                        >
                            <link.icon size={20} />
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer - Logout Button */}
                <div className="p-4 border-t border-indigo-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-3 p-3 rounded-xl text-red-300 hover:bg-indigo-700 hover:text-red-100 transition duration-200"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;