// src/Dashboard.jsx - CÓDIGO FINAL E REVISADO (Sidebar como DRAWER em todas as telas)

import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; 
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
            
            {/* 🚨 Sidebar (AGORA COMO DRAWER QUE DESLIZA SOBRE O CONTEÚDO) */}
            <div className={`fixed inset-y-0 left-0 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-40 border border-red-500`}>
                {/* A classe 'md:relative md:translate-x-0' foi removida para que o menu flutue sobre o conteúdo em todas as telas */}
                <Sidebar toggleSidebar={toggleSidebar} /> 
            </div>
            
            {/* O conteúdo do Sidebar sempre é renderizado. Se ele estiver aberto em telas grandes, 
                o conteúdo principal não se ajusta, pois o Sidebar não está ocupando espaço. */}
                
            {/* Overlay para fechar o sidebar em telas menores */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30" 
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Main Content (Onde o conteúdo da rota vai) */}
            <main className="flex-1 overflow-y-auto relative"> 
                
                {/* Botão de Toggle (Menu Hamburguer) - Fixo no canto superior esquerdo */}
                <button 
                    onClick={toggleSidebar}
                    // Mantido Fixo e Visível em todas as telas, já que o menu agora desliza sobre o conteúdo.
                    className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
                >
                    {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
                
                {/* Outlet renderiza o componente da rota aninhada (Kanban, LeadSearch, etc.) */}
                <div className="pt-16 p-4"> {/* Adicionado pt-16 para dar espaço ao botão fixo */}
                    <Outlet />
                </div>
                
            </main>
        </div>
    );
};

export default Dashboard;