// src/Dashboard.jsx - VERSÃO CORRETA PARA LAYOUT (Kanban)

import React from 'react';
import Sidebar from './components/Sidebar'; 
import KanbanBoard from './KanbanBoard'; 

const Dashboard = () => {
    return (
        <div className="flex h-screen bg-gray-100"> 
            <Sidebar />
            <main className="flex-1 overflow-y-auto"> 
                {/* O conteúdo do Dashboard é o Kanban */ }
                <KanbanBoard />
            </main>
        </div>
    );
};

export default Dashboard;