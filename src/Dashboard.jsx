// src/Dashboard.jsx - CÓDIGO FINAL COM SIDEBAR MINIMIZADO/EXPANSÍVEL E LAYOUT CORRIGIDO

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; 
import { Outlet } from 'react-router-dom'; // Importante para renderizar rotas aninhadas

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
            
            {/* Sidebar Container */}
            <div 
                className={`
                    fixed inset-y-0 left-0 
                    ${isMobileSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'} 
                    transition-transform duration-300 ease-in-out z-40 
                    md:relative md:translate-x-0 
                    ${sidebarWidthClass} // Aplica a largura condicional em desktop
                `}
            >
                {/* Passamos todos os handlers e o estado de expansão */}
                <Sidebar 
                    isExpanded={isSidebarExpanded} 
                    toggleExpansion={toggleSidebarExpansion} 
                    toggleMobileSidebar={toggleMobileSidebar} 
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
                // Ajusta a margem esquerda para compensar a largura do sidebar em desktop
                className={`
                    flex-1 overflow-y-auto 
                    transition-all duration-300 ease-in-out
                    ${mainMarginClass} // Margem dinâmica em desktop (ml-64 ou ml-20)
                `}
            > 
                {/* Botão de Toggle do Sidebar (Menu Hamburguer) - Apenas em mobile */}
                <button 
                    onClick={toggleMobileSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700 transition"
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* Outlet renderiza o componente da rota aninhada (KanbanBoard, LeadSearch, etc.) */}
                <div className="pt-16 md:pt-4 p-4"> {/* pt-16 para mobile, pt-4 para desktop */}
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;