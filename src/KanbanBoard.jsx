import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import { ArrowRight, Zap, Loader2, MapPin, Users, Phone, Menu, Search, Plus } from 'lucide-react'; 

// Simulação das etapas do seu CRM
const STAGES = [
    { id: 'contatar', title: '1. Para Contatar', color: 'bg-red-500' },
    { id: 'negociacao', title: '2. Em Negociação', color: 'bg-yellow-500' },
    { id: 'proposta', title: '3. Proposta Enviada', color: 'bg-blue-500' },
    { id: 'fechado', title: '4. Fechado', color: 'bg-green-500' },
    { id: 'perdido', title: '5. Perdido', color: 'bg-gray-500' },
];

// Componente LeadCard (Visualização em Lista) - Mantido igual para consistência
const LeadCard = ({ lead }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-indigo-500 mb-4 hover:shadow-lg transition duration-150">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-900 text-lg">{lead.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin size={12} className="mr-1 text-gray-400" /> {lead.address || 'Endereço Pendente'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Phone size={12} className="mr-1 text-gray-400" /> {lead.phone || 'Telefone Pendente'}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer flex items-center">
                        Ver Detalhes <ArrowRight size={10} className="inline ml-1" />
                    </span>
                    <button className="mt-2 text-xs bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600 transition">
                        Mudar Fase
                    </button>
                </div>
            </div>
        </div>
    );
};


// -----------------------------------------------------------
// Componente principal
// -----------------------------------------------------------
const KanbanBoard = ({ 
    leads, loading, error, searchTerm, setSearchTerm, handleLogout, 
    isSidebarOpen, setIsSidebarOpen, activeStage, setActiveStage 
}) => {
    
    const navigate = useNavigate();

    // 1. Lógica para filtrar Leads PELA FASE ATIVA E PELO TERMO DE BUSCA
    const currentStage = STAGES.find(s => s.id === activeStage);
    
    const filteredLeads = leads
        .filter(lead => 
            (lead.status && (lead.status.toLowerCase().includes(activeStage) || lead.status === currentStage.title))
        )
        .filter(lead => {
            const term = searchTerm.toLowerCase();
            return (
                (lead.name && lead.name.toLowerCase().includes(term)) ||
                (lead.address && lead.address.toLowerCase().includes(term)) ||
                (lead.phone && lead.phone.toLowerCase().includes(term))
            );
        });

    // 2. Função para renderizar as abas (Fases)
    const renderStageTabs = () => (
        // ✅ space-x-4 para espaçamento entre os botões
        <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto pb-4 mb-6">
            {STAGES.map(stage => {
                const isActive = stage.id === activeStage;
                // Estilo para a aba ativa (destaque)
                const activeClasses = 'bg-indigo-600 text-white shadow-lg';
                // Estilo para a aba inativa
                const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';

                return (
                    <button
                        key={stage.id}
                        onClick={() => setActiveStage(stage.id)}
                        // ✅ w-[200px] para largura fixa e text-center para centralizar o texto
                        className={`flex-shrink-0 w-[200px] text-center py-3 rounded-xl font-bold transition-colors duration-200 text-sm md:text-base 
                            ${isActive ? activeClasses : inactiveClasses}`}
                        // Removida a borda inferior, usando o fundo e a sombra para destaque.
                    >
                        {stage.title}
                    </button>
                );
            })}
        </div>
    );


    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 1. Sidebar (Menu Lateral) */}
            <Sidebar 
                handleLogout={handleLogout} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />

            {/* 2. Área de Conteúdo Principal */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                
                {/* 2.1. Header Fixo (Barra de Busca e Título) */}
                <header className="sticky top-0 z-30 bg-white shadow-lg p-4 flex items-center justify-between border-b border-gray-200">
                    
                    <div className="flex items-center">
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
                <main className="p-4 sm:p-6 flex-1">
                    
                    {/* ✅ ABAS DE FASES NA PARTE SUPERIOR (CORRIGIDAS) */}
                    {renderStageTabs()}

                    {/* Mensagens de Estado */}
                    {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
                            <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mr-2" />
                            <span className="text-lg text-indigo-500">Carregando Leads...</span>
                        </div>
                    ) : (
                        // Lista de Leads Filtrados
                        <div className="space-y-4">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)
                            ) : (
                                <div className="text-center text-gray-500 p-12 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-sm">
                                    <Zap size={24} className="mx-auto mb-3 text-indigo-400" />
                                    <p>Nenhum Lead encontrado na fase **{currentStage.title}**.</p>
                                    <p className="text-sm mt-1">Use a barra de busca ou mude de fase para encontrar Leads.</p>
                                </div>
                            )}
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