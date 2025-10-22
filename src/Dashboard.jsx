import React from 'react';
import Sidebar from './components/Sidebar'; 
// Assegure que o nome do arquivo seja 'KanbanBoard' (ou ajuste para 'KambanBoard')
import KanbanBoard from './KanbanBoard'; 

const Dashboard = () => {
    return (
        // Container principal que divide a tela entre Sidebar e Conteúdo
        <div className="flex h-screen bg-gray-100"> 
            
            {/* O Sidebar é a navegação lateral */}
            <Sidebar />
            
            {/* main: Ocupa o espaço restante e permite a rolagem apenas no conteúdo principal */}
            <main className="flex-1 overflow-y-auto"> 
                
                {/* O componente KanbanBoard é renderizado aqui. */}
                <KanbanBoard />
                
            </main>
        </div>
    );
};

export default Dashboard;