import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, MapPin, Users, LogOut, PlusCircle } from 'lucide-react';

const Sidebar = ({ handleLogout }) => {
    const location = useLocation();

    // Definição dos links da Sidebar
    const navItems = [
        { name: 'Dashboard', icon: Zap, path: '/dashboard' },
        { name: 'Mapa de Vendas', icon: MapPin, path: '/mapa' }, // Exemplo: Rota para o mapa
        { name: 'Cadastro de Leads', icon: PlusCircle, path: '/leads/cadastro' },
        { name: 'Minha Carteira', icon: Users, path: '/leads' }, // Exemplo: Lista de todos os leads
    ];

    return (
        // Sidebar fixa e oculta em telas menores (usando w-64 para largura)
        <div className="hidden md:flex flex-col w-64 bg-indigo-900 text-white p-4 space-y-6 min-h-screen">
            
            {/* Logo e Título */}
            <div className="flex items-center space-x-2 border-b border-indigo-700 pb-4">
                <Zap size={32} className="text-yellow-400" />
                <span className="text-2xl font-extrabold tracking-widest">GEOCRM</span>
            </div>

            {/* Links de Navegação */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        // Define a cor de fundo com base na rota atual
                        className={`flex items-center p-3 rounded-lg transition duration-200 
                            ${location.pathname === item.path 
                                ? 'bg-indigo-700 text-white shadow-lg' 
                                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`
                        }
                    >
                        <item.icon size={20} className="mr-3" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Rodapé da Sidebar (Botão Sair) */}
            <div className="border-t border-indigo-700 pt-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg text-red-300 hover:bg-red-700 hover:text-white transition duration-200"
                >
                    <LogOut size={20} className="mr-3" />
                    <span className="font-medium">Sair do Sistema</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;