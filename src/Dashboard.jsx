// src/Dashboard.jsx - CÓDIGO COMPLETO COM TEAL E ESTRUTURA DE LAYOUT (Outlet)

import React, { useState } from 'react';
import { FaBars, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa'; 
import { Outlet } from 'react-router-dom'; // CRÍTICO: Para Rotas Aninhadas
import Sidebar from './components/Sidebar'; 

const Dashboard = () => {
    // 1. Estado para EXPANSÃO (Desktop: ícones/ícones+texto). Por padrão, MINIMIZADO (false).
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); 
    
    // 2. Estado para MOBILE (Drawer: aberto/fechado).
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Função para alternar o estado de expansão (desktop)
    const toggleSidebarExpansion = () => {
        setIsSidebarExpanded(prev => !prev);
    };

    // Função para alternar a visibilidade do Sidebar em mobile (drawer)
    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(prev => !prev);
    };

    // Determina as classes de largura e margem
    const sidebarWidthClass = isSidebarExpanded ? 'md:w-64' : 'md:w-20'; // Desktop: 64 ou 20
    const mainMarginClass = isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'; // Desktop: ml-64 ou ml-20

    return (
        // Container principal
        <div className="flex h-screen bg-gray-100"> 
            
            {/* Sidebar (Controlado por ambos os estados e com transição de largura) */}
            <div 
                className={`
                    fixed inset-y-0 left-0 
                    ${isSidebarExpanded ? 'w-64' : 'w-20'} // Largura desktop padrão
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} // Toggle mobile
                    transition-all duration-300 ease-in-out z-40 
                    md:relative md:translate-x-0 // Visível sempre em desktop
                    ${sidebarWidthClass} // Aplica a largura do desktop
                `}
            >
                <Sidebar 
                    isExpanded={isSidebarExpanded} 
                    toggleExpansion={toggleSidebarExpansion}
                    toggleMobileSidebar={toggleMobileSidebar} // Passa a função de fechar mobile
                />
            </div>

            {/* Overlay para fechar o sidebar em telas menores */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
                    onClick={toggleMobileSidebar}
                />
            )}
            
            {/* Main Content (Conteúdo principal) */}
            <main 
                className={`
                    flex-1 overflow-y-auto 
                    transition-all duration-300 ease-in-out
                    ${mainMarginClass} // Margem dinâmica em desktop (ml-64 ou ml-20)
                `}
            > 
                {/* Botão de Toggle do Sidebar (Menu Hamburguer) - Apenas em mobile */}
                <button 
                    onClick={toggleMobileSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-teal-600 text-white rounded-full shadow-lg md:hidden hover:bg-teal-700 transition" // Botão mobile: bg-teal-600
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* Botão de Toggle para expandir/minimizar (apenas em desktop) */}
                <button
                    onClick={toggleSidebarExpansion}
                    className={`
                        hidden md:block // Visível apenas em desktop
                        fixed top-4 
                        ${isSidebarExpanded ? 'left-64' : 'left-20'} 
                        z-50 p-2 rounded-full shadow-lg 
                        bg-teal-600 text-white hover:bg-teal-700 transition // Botão desktop: bg-teal-600
                    `}
                    style={{
                        marginLeft: '-1rem' // Ajusta para o botão ficar um pouco fora do sidebar
                    }}
                >
                    {isSidebarExpanded ? <FaAngleDoubleLeft size={16} /> : <FaAngleDoubleRight size={16} />}
                </button>
                
                {/* Outlet renderiza o componente da rota aninhada (KanbanBoard, LeadSearch, etc.) */}
                <div className="pt-16 md:pt-4 p-4"> {/* pt-16 para mobile (para evitar o botão), pt-4 para desktop */}
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;