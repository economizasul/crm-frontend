// src/Dashboard.jsx - CÓDIGO FINAL COM SIDEBAR MINIMIZADO/EXPANSÍVEL E LAYOUT AJUSTADO

import React, { useState } from 'react';
import { FaBars, FaTimes, FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa'; 
import { Outlet } from 'react-router-dom'; 

import Sidebar from './components/Sidebar'; 

const Dashboard = () => {
    // 🚨 NOVO ESTADO: Controla se o Sidebar está expandido (ícones+texto) ou minimizado (apenas ícones)
    // Por padrão, queremos ele minimizado em desktop e como drawer em mobile.
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); 
    
    // Estado para controlar a visibilidade do Sidebar em mobile (drawer)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Função para alternar o estado de expansão (desktop)
    const toggleSidebarExpansion = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    // Função para alternar a visibilidade do Sidebar em mobile (drawer)
    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    // Determina a largura base do Sidebar para classes de main
    const sidebarWidthClass = isSidebarExpanded ? 'md:w-64' : 'md:w-20'; // md:w-20 para minimizado, md:w-64 para expandido
    const sidebarActualWidth = isSidebarExpanded ? 'w-64' : 'w-20'; // Usado para o próprio Sidebar

    return (
        <div className="flex h-screen bg-gray-100"> 
            
            {/* Sidebar (Agora com lógica de expansão e comportamento em mobile) */}
            {/* Em telas menores (mobile), ele ainda será um drawer 'fixed' */}
            {/* Em telas maiores (md), ele será 'relative' e ocupará espaço, ou 'fixed' e flutuará */}
            <div 
                // 🚨 CLASSES CRÍTICAS DO SIDEBAR CONTAINER
                className={`
                    fixed inset-y-0 left-0 
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    ${sidebarActualWidth} // Largura dinâmica em mobile e desktop
                    md:translate-x-0 // Sempre visível em desktop
                    ${sidebarWidthClass} // Ocupa espaço em desktop
                    bg-gray-800 text-white shadow-xl 
                    flex flex-col z-40 
                    transition-all duration-300 ease-in-out
                `}
            >
                {/* 🚨 Passe os dois estados para o Sidebar */}
                <Sidebar 
                    isExpanded={isSidebarExpanded} 
                    toggleExpansion={toggleSidebarExpansion} 
                    toggleMobileSidebar={toggleMobileSidebar} // Para o botão de fechar em mobile
                /> 
            </div>

            {/* Overlay para fechar o sidebar em telas menores */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
                    onClick={toggleMobileSidebar}
                />
            )}
            
            {/* Main Content (Onde o conteúdo da rota vai) */}
            <main 
                // 🚨 CLASSES CRÍTICAS DO CONTEÚDO PRINCIPAL (AJUSTA PADDING ESQUERDO)
                className={`
                    flex-1 overflow-y-auto 
                    transition-all duration-300 ease-in-out
                    pl-4 // Padding base para evitar que o conteúdo fique grudado na esquerda
                    ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'} // Ajusta margem esquerda em desktop
                    md:pt-4 // Padding superior em desktop
                `}
            > 
                {/* Botão de Toggle do Sidebar (em desktop) ou para abrir menu (em mobile) */}
                <button 
                    onClick={isMobileSidebarOpen ? toggleMobileSidebar : toggleSidebarExpansion}
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700 transition" // Botão mobile
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>

                {/* Botão de Toggle para expandir/minimizar (apenas em desktop) */}
                <button
                    onClick={toggleSidebarExpansion}
                    className={`
                        hidden md:block // Visível apenas em desktop
                        fixed top-4 
                        ${isSidebarExpanded ? 'left-[calc(16rem-1rem)]' : 'left-[calc(5rem-1rem)]'} // left-64-4 (240px) ou left-20-4 (64px)
                        z-50 p-2 rounded-full shadow-lg 
                        bg-indigo-600 text-white hover:bg-indigo-700 transition
                    `}
                    style={{
                        marginLeft: '-1rem' // Ajusta para o botão ficar um pouco fora do sidebar
                    }}
                >
                    {isSidebarExpanded ? <FaAngleDoubleLeft size={16} /> : <FaAngleDoubleRight size={16} />}
                </button>
                
                {/* Outlet renderiza o componente da rota aninhada */}
                <div className="pt-16 md:pt-4 p-4"> {/* pt-16 para mobile, pt-4 para desktop */}
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;