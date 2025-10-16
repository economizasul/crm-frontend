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
        // flex-wrap para garantir que, se faltar espaço, as abas quebrem
        // space-x-4 para espaçamento horizontal entre os botões
        <div className="flex flex-wrap space-x-6 border-b border-gray-200 overflow-x-auto pb-4 mb-6">
            {STAGES.map(stage => {
                const isActive = stage.id === activeStage;
                const activeClasses = 'bg-indigo-600 text-white shadow-lg';
                const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';

                return (
                    <button
                        key={stage.id}
                        onClick={() => setActiveStage(stage.id)}
                        // ✅ w-[200px] para largura fixa (ideal para 'Proposta Enviada')
                        // ✅ text-center para centralizar o texto
                        className={`flex-shrink-0 w-48 text-center py-3 rounded-xl font-bold transition-colors duration-200 text-sm md:text-base 
                            ${isActive ? activeClasses : inactiveClasses}`}
                    >
                        {stage.title}
                    </button>
                );
            })}
        </div>
    );


    return (
        // Garante que o conteúdo principal ocupe o espaço restante
        <div className="flex-1 p-6">
            
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1>
            
            {/* 1. Renderiza as abas de fases (que já estão horizontais) */}
            {renderStageTabs()}
            
            {/* 2. Barra de busca e Alerta de Erro */}
            {renderSearchBar()}
            {apiError && ( 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Falha ao carregar os dados.</strong>
                    <span className="block sm:inline"> Verifique a API. (Pode ser erro de CORS/Rede)</span>
                </div>
            )}

            {/* 🚨 3. CONTAINER DAS COLUNAS DE FASE (LAYOUT KANBAN HORIZONTAL) 🚨 */}
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    // ✅ Coluna individual: w-64 para largura fixa, flex-shrink-0 para não encolher.
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-64 p-3 bg-gray-100 rounded-lg shadow-inner"
                    >
                        {/* Título da Fase */}
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">
                            {stage.title}
                        </h3>
                        
                        {/* Placeholder/Indicador de Leads (corpo da coluna) */}
                        <div className="text-sm text-gray-500 mb-4 h-24 flex items-center justify-center border-dashed border-2 border-gray-300 rounded">
                            Nenhum Lead nesta etapa.
                        </div>
                        
                        {/* Botão Novo Lead */}
                        <button className="w-full py-2 px-4 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-100 transition duration-150 flex items-center justify-center space-x-2">
                            <span>+ Novo Lead</span>
                        </button>

                    </div>
                ))}
            </div>

        </div>
    );

export default KanbanBoard;