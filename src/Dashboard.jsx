import React from 'react';
import Sidebar from './components/Sidebar'; 
import KanbanBoard from './KanbanBoard'; 

const Dashboard = () => {
    return (
        <div className="flex h-screen bg-gray-100"> 
            <Sidebar />
            
            {/* Ocupa o espaço restante e permite a rolagem */}
            <main className="flex-1 overflow-y-auto"> 
                <KanbanBoard />
            </main>
        </div>
    );
};

export default Dashboard;