import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, LogOut, X, Settings, FileText, ChevronDown, ChevronUp } from 'lucide-react';

// Define o estilo de link ativo e inativo (Tailwind)
const LinkClass = ({ isActive }) => 
    `flex items-center space-x-3 p-3 rounded-xl transition duration-200 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

const Sidebar = ({ handleLogout, isSidebarOpen, setIsSidebarOpen }) => {
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    // Links de navegação principais
    const navLinks = [
        { name: "Kanban Leads", path: "/dashboard", icon: LayoutDashboard }, // Dashboard agora é o Kanban
        { name: "Cadastrar Lead", path: "/leads/cadastro", icon: Zap },
        { name: "Transferir Lead", path: "/leads/transferir", icon: Users }, // Rota fictícia por enquanto
    ];

    return (
        <>
            {/* ... (Overlay e Estrutura Principal da Sidebar) ... */}
            <aside 
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 transition-transform duration-300 w-64 bg-indigo-900 text-white z-50 shadow-2xl flex flex-col`}
            >
                
                {/* Cabeçalho/Logo (ECONOMIZA SUL CRM) */}
                <div className="p-6 border-b border-indigo-700 flex justify-between items-center">
                    <h1 className="text-xl font-extrabold tracking-wider leading-none">
                        ECONOMIZA SUL CRM
                    </h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-white p-1 rounded-full hover:bg-indigo-700 md:hidden" aria-label="Fechar Menu">
                        <X size={24} />
                    </button>
                </div>

                {/* Links de Navegação */}
                <nav className="flex-1 p-4 space-y-2">
                    {/* Links Estáticos */}
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={LinkClass}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <link.icon size={20} />
                            <span>{link.name}</span>
                        </NavLink>
                    ))}

                    {/* Menu de Relatórios (Dropdown) */}
                    <div>
                        <button
                            onClick={() => setIsReportsOpen(!isReportsOpen)}
                            className={`w-full flex items-center justify-between space-x-3 p-3 rounded-xl transition duration-200 ${isReportsOpen ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <FileText size={20} />
                                <span>Relatórios</span>
                            </div>
                            {isReportsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {/* Submenus (Aparecem quando isReportsOpen é true) */}
                        {isReportsOpen && (
                            <div className="pl-6 pt-1 space-y-1">
                                <NavLink to="/reports/vendas" className={({ isActive }) => `block py-2 px-3 rounded-md text-sm transition ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
                                    Relatório de Vendas
                                </NavLink>
                                <NavLink to="/reports/funil" className={({ isActive }) => `block py-2 px-3 rounded-md text-sm transition ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
                                    Funil de Leads
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Link de Configurações */}
                    <NavLink
                        to="/settings" // Rota fictícia por enquanto
                        className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-xl transition duration-200 ${isActive ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Settings size={20} />
                        <span>Configurações</span>
                    </NavLink>

                </nav>

                {/* Footer - Logout Button (Mantido) */}
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