// src/Dashboard.jsx - CÓDIGO ATUALIZADO COM SIDEBAR TOGGLE

import React, { useState } from 'react';
import Sidebar from './components/Sidebar'; 
import KanbanBoard from './KanbanBoard'; 
import { FaBars, FaTimes } from 'react-icons/fa'; // Ícones para o menu

const Dashboard = () => {
    // Novo estado para controlar a visibilidade do Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Função para alternar o estado do Sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        // Container principal
        <div className="flex h-screen bg-gray-100"> 
            
            {/* Sidebar (Agora controlado pelo estado) */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0`}>
                <Sidebar />
            </div>

            {/* Overlay para fechar o sidebar em telas menores */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative"> 
                
                {/* Botão de Toggle (Menu Hamburguer) - Fixo no canto superior esquerdo */}
                <button 
                    onClick={toggleSidebar}
                    // Posicionamento: Fixo, mas invisível em telas maiores que 'md' (768px)
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700 transition"
                >
                    {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* O componente KanbanBoard é renderizado aqui. */}
                <div className="pt-4 md:pt-0"> {/* Adiciona padding superior para não ficar por baixo do botão na versão mobile */}
                    <KanbanBoard />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;