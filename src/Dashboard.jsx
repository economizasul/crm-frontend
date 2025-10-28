// src/Dashboard.jsx - CÓDIGO DE DEBUG E ISOLAMENTO DE SIDEBAR

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; 
import { Outlet } from 'react-router-dom'; 

// 🚨 MANTÉM A IMPORTAÇÃO, MAS NÃO A UTILIZA
import Sidebar from './components/Sidebar'; 

const Dashboard = () => {
    // 1. Estado para EXPANSÃO (Desktop) - ⛔ COMENTADO PARA DEBUG
    // const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); 
    
    // 2. Estado para MOBILE (Drawer)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Função para alternar o estado de expansão (desktop) - ⛔ COMENTADO PARA DEBUG
    // const toggleSidebarExpansion = () => {
    //     setIsSidebarExpanded(prev => !prev);
    // };

    // Função para alternar a visibilidade do Sidebar em mobile (drawer)
    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(prev => !prev);
    };

    // Determina as classes de largura e margem (FORÇANDO SEM SIDEBAR FIXO)
    // O Main Content agora começa no zero (ml-0), forçando a exibição do conteúdo
    const sidebarWidthClass = 'md:w-0'; 
    const mainMarginClass = 'md:ml-0'; 

    return (
        <div className="flex h-screen bg-gray-50">
            
            {/* ⛔ SIDEBAR COMENTADO: Desativado para debug.
            <Sidebar
                isSidebarExpanded={isSidebarExpanded}
                toggleSidebarExpansion={toggleSidebarExpansion}
                isMobileSidebarOpen={isMobileSidebarOpen}
                toggleMobileSidebar={toggleMobileSidebar}
                sidebarWidthClass={sidebarWidthClass}
            />
            */}

            {/* Overlay em Mobile (quando o sidebar está aberto) */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
                    onClick={toggleMobileSidebar}
                />
            )}
            
            {/* Main Content (Conteúdo principal) */}
            <main 
                // 🚨 CRÍTICO: Removida a margem dinâmica (ml-64 ou ml-20) e forçada para ml-0
                className={`
                    flex-1 overflow-y-auto 
                    transition-all duration-300 ease-in-out
                    ${mainMarginClass} // Força ml-0 em desktop
                `}
            > 
                {/* Botão de Toggle do Sidebar (Menu Hamburguer) - Apenas em mobile */}
                <button 
                    onClick={toggleMobileSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700 transition"
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* Outlet renderiza o componente da rota aninhada (KanbanBoard, LeadSearch, etc) */}
                <div className="pt-16 md:pt-4 p-4"> 
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;