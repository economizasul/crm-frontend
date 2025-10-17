import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';

// Definição estática das fases do Kanban
const STAGES = [
    { id: 1, title: '1. Para Contatar', color: 'bg-blue-500' },
    { id: 2, title: '2. Em Negociação', color: 'bg-yellow-500' },
    { id: 3, title: '3. Proposta Enviada', color: 'bg-green-500' },
    { id: 4, title: '4. Fechado', color: 'bg-gray-500' },
    { id: 5, title: '5. Perdido', color: 'bg-red-500' },
];

const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [activeStage, setActiveStage] = useState(STAGES[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(false);
    
    // Filtra os leads (lógica que será usada quando a API funcionar)
    const filteredLeads = leads.filter(lead => {
        const matchesStage = lead.stageId === activeStage;
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStage && matchesSearch;
    });

    // Função para renderizar a barra de busca
    const renderSearchBar = () => (
        <div className="mb-6">
            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar leads por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>
    );
    
    // Opcional: Simulação de erro de API
    useEffect(() => {
        setApiError(true);
    }, []);

    return (
        // O px-6 e pt-6 (padding) devem estar no Dashboard.jsx,
        // mas mantemos aqui para garantir o layout interno.
        <div className="flex-1 p-6">
            
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1>
            
            {/* 🚨 Nova Estrutura de Abas de Fases Horizontal (Botões) 🚨 */}
            {/* Mantemos esta estrutura para navegação entre as colunas, se necessário */}
            <div className="flex flex-wrap space-x-4 border-b border-gray-200 overflow-x-auto pb-4 mb-6">
                {STAGES.map(stage => {
                    const isActive = stage.id === activeStage;
                    const activeClasses = 'bg-indigo-600 text-white shadow-lg';
                    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300';
                    
                    return (
                        <button
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={`flex-shrink-0 w-48 text-center py-3 rounded-xl font-bold transition-colors duration-200 text-sm md:text-base 
                                ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {stage.title}
                        </button>
                    );
                })}
            </div>

            {/* Barra de busca e Alerta de Erro */}
            {renderSearchBar()}
            {apiError && ( 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                    <FaBolt className="mr-3" />
                    <strong className="font-bold mr-1">Falha ao carregar os dados.</strong>
                    <span className="block sm:inline"> Verifique a API. (Pode ser erro de CORS/Rede)</span>
                </div>
            )}

            {/* 🚨 CONTAINER PRINCIPAL DAS COLUNAS DE FASE HORIZONTAL 🚨 */}
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    // Coluna individual: w-64 para largura fixa e flex-shrink-0 para não encolher.
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-64 p-3 bg-gray-100 rounded-lg shadow-inner"
                    >
                        {/* Título da Fase */}
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">
                            {stage.title}
                        </h3>
                        
                        {/* Placeholder/Corpo da Coluna */}
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
};

export default KanbanBoard;