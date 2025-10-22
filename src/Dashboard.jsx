// src/Dashboard.jsx - VERSÃO RESTAURADA PARA LAYOUT (Contêiner do Kanban)

import React from 'react';
import Sidebar from './components/Sidebar'; 
import KanbanBoard from './KanbanBoard'; // Importa o Kanban

const Dashboard = () => {
    return (
        // Container principal que divide a tela entre Sidebar e Conteúdo
        <div className="flex h-screen bg-gray-100"> 
            
            <Sidebar />
            
            {/* main: Ocupa o espaço restante e permite a rolagem apenas no conteúdo principal */}
            <main className="flex-1 overflow-y-auto"> 
                
                {/* Renderiza o Kanban */}
                <KanbanBoard />
                
            </main>
        </div>
    );
};

export default Dashboard;