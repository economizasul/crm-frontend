// src/Dashboard.jsx
import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';  // Ajuste o path se necessário

const Dashboard = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);  // Começa expandido
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebarExpansion = () => setIsSidebarExpanded(prev => !prev);
    const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

    const sidebarWidth = isSidebarExpanded ? 'md:w-64' : 'md:w-20';
    const mainMargin = isSidebarExpanded ? 'md:ml-64' : 'md:ml-20';

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Desktop (fixo à esquerda) */}
            <aside className={`${sidebarWidth} bg-gray-800 text-white transition-all duration-300 ease-in-out flex-shrink-0`}>
                <Sidebar
                    isExpanded={isSidebarExpanded}
                    toggleExpansion={toggleSidebarExpansion}
                    toggleMobileSidebar={toggleMobileSidebar}
                />
            </aside>

            {/* Overlay Mobile */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ease-in-out ${mainMargin} overflow-hidden`}>
                {/* Botão Mobile Hamburguer (posição fixa para não interferir) */}
                <button 
                    onClick={toggleMobileSidebar}
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>

                {/* Conteúdo do Outlet (com padding ajustado) */}
                <div className="h-full p-4 overflow-y-auto pt-4 md:pt-0">  {/* Removido pt-16 excessivo */}
                    <Outlet />
                </div>
            </main>

            {/* Mobile Sidebar (drawer sobreposto) */}
            {isMobileSidebarOpen && (
                <div className="fixed top-0 left-0 h-full w-64 z-50 md:hidden transform transition-transform duration-300 translate-x-0">
                    <Sidebar
                        isExpanded={true}  // Sempre expandido em mobile
                        toggleExpansion={() => {}}  // Não usado em mobile
                        toggleMobileSidebar={toggleMobileSidebar}
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;