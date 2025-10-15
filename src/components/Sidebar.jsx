import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Ícones Lucide-React
import { Zap, MapPin, Users, LogOut, PlusCircle, X } from 'lucide-react'; 

// Adicionamos as props isSidebarOpen e setIsSidebarOpen para o controle mobile
const Sidebar = ({ handleLogout, isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();

    // Definição dos links da Sidebar
    const navItems = [
        { name: 'Dashboard', icon: Zap, path: '/dashboard' },
        { name: 'Minha Carteira', icon: Users, path: '/leads' }, 
        { name: 'Cadastro Rápido', icon: PlusCircle, path: '/leads/cadastro' },
        { name: 'Mapa de Vendas', icon: MapPin, path: '/mapa' },
    ];

    // Função auxiliar para classes de link
    const getLinkClasses = (path) => {
        const isActive = location.pathname === path;
        
        // Classes base
        let classes = "flex items-center p-3 rounded-lg transition duration-200 text-sm font-semibold";
        
        // Classes ativas (seção atual) - Mais brilhante, com fundo sólido
        if (isActive) {
            classes += ' bg-indigo-700 text-white shadow-lg border-l-4 border-yellow-400';
        } 
        // Classes inativas
        else {
            classes += ' text-indigo-200 hover:bg-indigo-800 hover:text-white';
        }
        
        return classes;
    };

    return (
        <>
            {/* 1. Sidebar para Desktop (Fixa e sempre visível) */}
            <div className="hidden md:flex flex-col w-64 bg-indigo-900 text-white p-5 space-y-6 min-h-screen shadow-2xl">
                
                {/* Logo e Título Moderno */}
                <div className="flex items-center space-x-2 border-b border-indigo-700 pb-5">
                    <Zap size={36} className="text-yellow-400" />
                    <span className="text-2xl font-black tracking-wider">GEOCRM</span>
                </div>

                {/* Links de Navegação */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={getLinkClasses(item.path)}
                        >
                            <item.icon size={20} className="mr-4" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Rodapé da Sidebar (Botão Sair) */}
                <div className="border-t border-indigo-700 pt-5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-lg text-red-300 hover:bg-red-700 hover:text-white transition duration-200 text-sm font-semibold"
                    >
                        <LogOut size={20} className="mr-4" />
                        <span>Sair do Sistema</span>
                    </button>
                    <p className="mt-3 text-xs text-indigo-400 text-center">
                        &copy; 2025 GEOCRM
                    </p>
                </div>
            </div>

            {/* 2. Sidebar para Mobile (Slide-Out com Transição) */}
            <div 
                className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-indigo-900 text-white p-5 space-y-6 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Cabeçalho Mobile com botão de Fechar */}
                <div className="flex justify-between items-center border-b border-indigo-700 pb-5">
                    <div className="flex items-center space-x-2">
                        <Zap size={36} className="text-yellow-400" />
                        <span className="text-2xl font-black tracking-wider">GEOCRM</span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-indigo-200 hover:text-white p-1 rounded-full hover:bg-indigo-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Links de Navegação Mobile (Reutiliza as mesmas classes) */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={getLinkClasses(item.path)}
                            onClick={() => setIsSidebarOpen(false)} // Fecha ao clicar em um link
                        >
                            <item.icon size={20} className="mr-4" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Botão Sair Mobile */}
                <div className="border-t border-indigo-700 pt-5">
                    <button
                        onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                        className="flex items-center w-full p-3 rounded-lg text-red-300 hover:bg-red-700 hover:text-white transition duration-200 text-sm font-semibold"
                    >
                        <LogOut size={20} className="mr-4" />
                        <span>Sair do Sistema</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;