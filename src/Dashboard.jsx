// src/Dashboard.jsx - CÓDIGO FINAL COM SIDEBAR MINIMIZADO/EXPANSÍVEL E CORES AJUSTADAS

import React, { useState } from 'react';
// Ícones para o menu e expansão
import { FaBars, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa'; 
import { Outlet } from 'react-router-dom'; 

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
            
            {/* Sidebar (Controlado) */}
            <div className={`fixed inset-y-0 left-0 transform 
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                transition-transform duration-300 ease-in-out z-40 
                md:relative md:translate-x-0 ${sidebarWidthClass}`
            }>
                {/* Passamos o estado e as funções de toggle */}
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
                // CRÍTICO: Ajusta a margem esquerda para compensar a largura do sidebar
                className={`
                    flex-1 overflow-y-auto 
                    transition-all duration-300 ease-in-out
                    ${mainMarginClass} // Margem dinâmica em desktop (ml-64 ou ml-20)
                `}
            > 
                {/* Botão de Toggle do Sidebar (Menu Hamburguer) - Apenas em mobile */}
                <button 
                    onClick={toggleMobileSidebar}
                    // AJUSTE DE COR: indigo-600 -> green-600 / hover:bg-indigo-700 -> hover:bg-green-700
                    className="fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-full shadow-lg md:hidden hover:bg-green-700 transition"
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* Botão de Toggle para expandir/minimizar (apenas em desktop) */}
                <button
                    onClick={toggleSidebarExpansion}
                    className={`
                        hidden md:block 
                        fixed top-4 
                        ${isSidebarExpanded ? 'left-[calc(16rem-1rem)]' : 'left-[calc(5rem-1rem)]'} 
                        z-50 p-2 rounded-full shadow-lg 
                        // AJUSTE DE COR: indigo-600 -> green-600 / hover:bg-indigo-700 -> hover:bg-green-700
                        bg-green-600 text-white hover:bg-green-700 transition
                    `}
                    style={{
                        marginLeft: '-1rem' // Ajusta para o botão ficar um pouco fora do sidebar
                    }}
                >
                    {isSidebarExpanded ? <FaAngleDoubleLeft size={16} /> : <FaAngleDoubleRight size={16} />}
                </button>
                
                {/* Outlet renderiza o componente da rota aninhada (KanbanBoard, LeadSearch, etc.) */}
                <div className="pt-16 md:pt-4 p-4"> {/* pt-16 para mobile, pt-4 para desktop (para evitar o botão) */}
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;