import React from 'react';
import Sidebar from './sidebar.jsx'; 
import KanbanBoard from './kanbanboard.jsx';

const Dashboard = () => {
    return (
        // Container principal: Flexbox (lado a lado) e ocupa a altura total (h-screen)
        <div className="flex h-screen bg-gray-100"> 
            
            {/* Componente Sidebar: Fundo roxo e largura fixa */}
            <Sidebar />

            {/* Conteúdo Principal: Ocupa o espaço restante (flex-1) e é rolável */}
            <main className="flex-1 overflow-y-auto">
                
                {/* O KanbanBoard já contém o título, barra de busca e o corpo horizontal */}
                <KanbanBoard />
                
            </main>
            
        </div>
    );
};

export default Dashboard;