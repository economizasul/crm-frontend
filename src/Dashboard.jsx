// src/Dashboard.jsx - CÓDIGO FINAL E REVISADO (LAYOUT COMPONENT com Toggle)

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; 
// IMPORT CRÍTICO: Usamos Outlet para renderizar rotas filhas
import { Outlet } from 'react-router-dom'; 

import Sidebar from './components/Sidebar'; 

const Dashboard = () => {
    // Estado para controlar a visibilidade do Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Função para alternar o estado do Sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        // Container principal (pai do layout)
        <div className="flex h-screen bg-gray-100"> 
            
            {/* Sidebar (Controlado e fixo) */}
            <div className={`fixed inset-y-0 left-0 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0`}>
                {/* 🚨 Passa a função de toggle para o Sidebar */}
                <Sidebar toggleSidebar={toggleSidebar} /> 
            </div>

            {/* Overlay para fechar o sidebar em telas menores */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Main Content (Onde o conteúdo da rota vai) */}
            <main className="flex-1 overflow-y-auto relative"> 
                
                {/* Botão de Toggle (Menu Hamburguer) - Visível APENAS em telas pequenas */}
                <button 
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700 transition"
                >
                    {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* 🚨 Outlet renderiza o componente da rota aninhada (Kanban, LeadSearch, etc.) */}
                <div className="pt-4 md:pt-0"> 
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;