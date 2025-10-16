import React, { useState } from 'react';
import { 
    Zap, Users, LogOut, X, Settings, FileText, ChevronDown, ChevronUp,
    LayoutDashboard, ArrowRight, Search // Adicionado Search para o novo item
} from 'lucide-react';

// Estilos de Link Padronizados: Garante largura total (w-full) e alinhamento à esquerda
const LinkClass = ({ isActive }) => 
    `w-full flex items-center space-x-3 p-3 rounded-xl transition duration-200 justify-start 
    ${isActive 
        ? 'bg-indigo-700 text-white shadow-lg' 
        : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`;

const Sidebar = ({ handleLogout, isSidebarOpen, setIsSidebarOpen }) => {
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    // Lista de Menus Principais ATUALIZADA com 'Buscar Lead' no topo
    const navLinks = [
        // ✅ NOVO ITEM: BUSCAR LEAD
        { name: "Buscar Lead", path: "/leads/search", icon: Search },
        
        { name: "Kanban Leads", path: "/dashboard", icon: LayoutDashboard },
        { name: "Cadastrar Lead", path: "/leads/cadastro", icon: Zap },
        { name: "Transferir Lead", path: "/leads/transferir", icon: Users },
    ];
    
    // Simulação da URL atual para fins de estilo (em um app real seria 'useLocation')
    const currentPath = window.location.pathname;

    return (
        <aside 
            className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 transition-transform duration-300 w-64 bg-indigo-900 text-white z-50 shadow-2xl flex flex-col`}
        >
            
            <div className="p-6 border-b border-indigo-700 flex justify-between items-center">
                <h1 className="text-xl font-extrabold tracking-wider leading-none">
                    ECONOMIZA SUL
                </h1>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white p-1 rounded-full hover:bg-indigo-700 md:hidden" aria-label="Fechar Menu">
                    <X size={24} />
                </button>
            </div>

            {/* Conteiner dos Links com espaçamento (space-y-2) */}
            <nav className="flex-1 p-4 space-y-2">
                {navLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.path}
                        className={LinkClass({ isActive: currentPath === link.path })}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <link.icon size={20} />
                        <span className="truncate">{link.name}</span>
                    </a>
                ))}

                {/* Menu de Relatórios (Dropdown) */}
                <div>
                    <button
                        onClick={() => setIsReportsOpen(!isReportsOpen)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition duration-200 
                            ${isReportsOpen ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <FileText size={20} />
                            <span>Relatórios</span>
                        </div>
                        {isReportsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isReportsOpen && (
                        <div className="pl-6 pt-1 space-y-1">
                             <a href="/reports/vendas" className="block py-2 px-3 rounded-md text-sm transition text-indigo-200 hover:bg-indigo-800 flex items-center">
                                <ArrowRight size={14} className="mr-2" /> Relatório de Vendas
                            </a>
                            <a href="/reports/funil" className="block py-2 px-3 rounded-md text-sm transition text-indigo-200 hover:bg-indigo-800 flex items-center">
                                <ArrowRight size={14} className="mr-2" /> Funil de Leads
                            </a>
                        </div>
                    )}
                </div>

                {/* Link de Configurações */}
                <a
                    href="/settings"
                    className={LinkClass({ isActive: currentPath === '/settings' })}
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <Settings size={20} />
                    <span>Configurações</span>
                </a>
            </nav>

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
    );
};

export default Sidebar;