// src/Dashboard.jsx - SIDEBAR: 80px (fechado) → 160px (aberto)

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const Dashboard = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebarExpansion = () => setIsSidebarExpanded(prev => !prev);
    const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

    // LARGURA DO SIDEBAR
    const sidebarWidthClass = isSidebarExpanded ? 'md:w-40' : 'md:w-20'; // 160px / 80px
    const mainMarginClass = isSidebarExpanded ? 'md:ml-40' : 'md:ml-20'; // ACOMPANHA

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Fixo */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-40
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${sidebarWidthClass}
                    md:translate-x-0
                    bg-gray-800 text-white shadow-xl
                    flex flex-col
                    transition-all duration-300 ease-in-out
                `}
            >
                <Sidebar
                    isExpanded={isSidebarExpanded}
                    toggleExpansion={toggleSidebarExpansion}
                    toggleMobileSidebar={toggleMobileSidebar}
                />
            </div>

            {/* Overlay Mobile */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Main Content - Kanban colado no sidebar */}
            <main
                className={`
                    flex-1 overflow-y-auto
                    transition-all duration-300 ease-in-out
                    ${mainMarginClass}
                `}
            >
                {/* Botão Mobile */}
                <button
                    onClick={toggleMobileSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700"
                >
                    {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>

                {/* Conteúdo (KanbanBoard, etc.) */}
                <div className="pt-16 md:pt-4 p-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;