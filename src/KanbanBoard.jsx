import React from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Importação da Sidebar
import Sidebar from './components/Sidebar'; 
// Importações de ícones Lucide
import { ArrowRight, Zap, Loader2, MapPin, Users, Phone, Menu, Search, Plus } from 'lucide-react'; 

// Simulação das etapas do seu CRM
const STAGES = [
    { id: 'contatar', title: '1. Para Contatar', color: 'bg-red-500' },
    { id: 'negociacao', title: '2. Em Negociação', color: 'bg-yellow-500' },
    { id: 'proposta', title: '3. Proposta Enviada', color: 'bg-blue-500' },
    { id: 'fechado', title: '4. Fechado', color: 'bg-green-500' },
    { id: 'perdido', title: '5. Perdido', color: 'bg-gray-500' },
];

// Componente para representar cada coluna do Kanban
const KanbanColumn = ({ stage, leads }) => {
    
    // Função para simular a mudança de fase (Avançar Fase)
    const handleStageAdvance = () => {
        // Implementação futura: Abrir um Modal com a lista de leads para selecionar qual mudar de fase
        console.log(`Ação: Modal de Seleção de Lead para Mudar Fase na etapa: ${stage.title}`);
        alert(`Abrir Modal de Seleção de Lead para Mudar Fase na etapa: ${stage.title}`);
    };
    
    // Renderiza o cartão individual do lead
    const renderLeadCard = (lead) => (
        <div key={lead.id} className="bg-white p-4 rounded-lg shadow-md border-t-4 border-indigo-500 mb-3 cursor-grab hover:shadow-xl transition duration-150">
            <h4 className="font-bold text-gray-900 truncate">{lead.name}</h4>
            <p className="text-sm text-gray-600 flex items-center mt-1">
                <MapPin size={12} className="mr-1 text-gray-400" /> {lead.address || 'Endereço Pendente'}
            </p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
                <Phone size={12} className="mr-1 text-gray-400" /> {lead.phone || 'Telefone Pendente'}
            </p>
            <div className="mt-2 text-right">
                 {/* Link para visualização de detalhes do Lead */}
                 <span className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">Ver Detalhes <ArrowRight size={10} className="inline ml-1" /></span>
            </div>
        </div>
    );

    return (
        // Estilização da Coluna
        // A classe min-w-[280px] e max-w-[350px] é fundamental para que as colunas fiquem lado a lado corretamente.
        <div className="flex-1 flex flex-col bg-gray-100 rounded-xl p-4 shadow-inner min-w-[280px] max-w-[350px]">
            {/* Cabeçalho da Coluna */}
            <div className={`p-3 rounded-lg shadow-md text-white font-bold mb-4 flex items-center justify-between ${stage.color}`}>
                <h3 className="text-lg">{stage.title}</h3>
                <span className="text-sm bg-white text-gray-800 rounded-full px-2 py-0.5 font-extrabold">{leads.length}</span>
            </div>
            
            {/* Contêiner dos Leads (Scrollable) */}
            <div className="flex-1 space-y-3 overflow-y-auto">
                {leads.map(renderLeadCard)}
                
                {leads.length === 0 && (
                    <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        Nenhum Lead nesta etapa.
                    </div>
                )}
            </div>
            
            {/* BOTÃO CORRIGIDO: Avançar Fase */}
            <button 
                onClick={handleStageAdvance}
                className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center font-semibold"
            >
                <ArrowRight size={16} className="inline mr-2" /> Avançar Fase
            </button>
        </div>
    );
};


// -----------------------------------------------------------
// Componente principal que recebe os dados do Dashboard.jsx
// -----------------------------------------------------------
const KanbanBoard = ({ leads, loading, error, searchTerm, setSearchTerm, handleLogout, isSidebarOpen, setIsSidebarOpen }) => {
    
    const navigate = useNavigate();

    // Lógica para agrupar leads por estágio e filtrar por termo de busca
    const groupedLeads = STAGES.reduce((acc, stage) => {
        // ... (lógica de agrupamento e filtro mantida) ...
        const filteredByStage = leads.filter(lead => 
            (lead.status && (lead.status.toLowerCase().includes(stage.id) || lead.status === stage.title))
        );
        
        const finalFilteredLeads = filteredByStage.filter(lead => {
            const term = searchTerm.toLowerCase();
            return (
                (lead.name && lead.name.toLowerCase().includes(term)) ||
                (lead.address && lead.address.toLowerCase().includes(term)) ||
                (lead.phone && lead.phone.toLowerCase().includes(term))
            );
        });
        
        acc[stage.id] = finalFilteredLeads;
        return acc;
    }, {});
    
    // Função para renderizar as colunas
    const renderColumns = () => {
        return STAGES.map(stage => (
            <KanbanColumn 
                key={stage.id} 
                stage={stage} 
                leads={groupedLeads[stage.id] || []} 
            />
        ));
    }


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 1. Sidebar (Menu Lateral) */}
            <Sidebar 
                handleLogout={handleLogout} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />

            {/* 2. Área de Conteúdo Principal */}
            {/* md:ml-64 empurra o conteúdo para a direita, deixando espaço para a Sidebar */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                
                {/* 2.1. Header Fixo (Barra de Busca e Título) */}
                <header className="sticky top-0 z-30 bg-white shadow-lg p-4 flex items-center justify-between border-b border-gray-200">
                    
                    <div className="flex items-center">
                        {/* Botão para abrir a Sidebar no Mobile */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-600 p-2 rounded-full hover:bg-gray-100 md:hidden transition"
                            aria-label="Abrir Menu"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-800 ml-3 hidden sm:block">
                            ®FerreiraNei 
                        </h1>
                    </div>
                    
                    {/* Campo de Busca */}
                    <div className="relative w-full max-w-sm md:max-w-md">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar leads por nome, endereço ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    
                    <div className="hidden sm:block w-10"></div>
                </header>

                {/* 2.2. Main Content Area */}
                <main className="p-4 sm:p-6 flex-1 overflow-x-auto">
                    {/* Mensagens de Estado */}
                    {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
                            <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mr-2" />
                            <span className="text-lg text-indigo-500">Carregando Etapas...</span>
                        </div>
                    ) : (
                        // Kanban Container: flex e overflow-x-auto são essenciais para as colunas horizontais
                        <div className="flex space-x-6 h-full min-h-[70vh] items-start pb-4">
                            {renderColumns()}
                        </div>
                    )}
                </main>
                
                {/* Botão Flutuante de Adicionar NOVO LEAD (Cadastro) */}
                <button 
                    onClick={() => navigate('/leads/cadastro')}
                    className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition duration-300 z-40 flex items-center justify-center"
                    title="Adicionar Novo Lead"
                >
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
};

export default KanbanBoard;