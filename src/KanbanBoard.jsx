import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';

// Definição estática das fases do Kanban
const STAGES = [
    { id: 1, title: 'Para Contatar', color: 'bg-blue-500' }, // Títulos mais curtos como na imagem
    { id: 2, title: 'Em Conversação', color: 'bg-yellow-500' },
    { id: 3, title: 'Proposta Enviada', color: 'bg-green-500' },
    { id: 4, title: 'Fechado', color: 'bg-gray-500' },
    { id: 5, title: 'Perdido', color: 'bg-red-500' },
];

const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [activeStage, setActiveStage] = useState(STAGES[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(true); // Manter como 'true' por enquanto

    // ... (restante da lógica de filtragem e useEffect)

    // Função para renderizar a barra de busca (agora no topo)
    const renderSearchBar = () => (
        <div className="mb-6"> {/* Espaçamento após a barra */}
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

    return (
        // flex-1 p-6 para o padding geral e para ocupar o espaço restante na main
        <div className="flex-1 p-6"> 
            
            {/* 🚨 1. Barra de Pesquisa no Topo, acima de tudo 🚨 */}
            {renderSearchBar()}
            
            {/* 🚨 2. Título do Kanban (Removido ou Ajustado para a imagem) */}
            {/* <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1> */}
            {/* O título "Kanban de Leads" da imagem parece ser parte do Sidebar.jsx ou do Dashboard.jsx,
                então o removemos daqui para evitar duplicação e seguir a imagem. */}
            
            {/* Alerta de Erro (Mantido) */}
            {apiError && ( 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                    <FaBolt className="mr-3" />
                    <strong className="font-bold mr-1">Falha ao carregar os dados.</strong>
                    <span className="block sm:inline"> Verifique a API. (Pode ser erro de CORS/Rede)</span>
                </div>
            )}
            
            {/* 🚨 3. ABAS DE FASES HORIZONTAIS (Botões de navegação, sem duplicidade) 🚨 */}
            {/* O espaçamento e o design dos botões devem ficar como na imagem */}
            <div className="flex flex-wrap space-x-4 mb-6"> {/* Removido border-b e pb-4 aqui para um visual mais limpo */}
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

            {/* 🚨 4. CONTAINER PRINCIPAL DAS COLUNAS DE FASE HORIZONTAL 🚨 */}
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    // Coluna individual (Esta é a estrutura correta das colunas de conteúdo)
                    <div 
                        key={stage.id} 
                        // Notei que na imagem, o título da coluna (Para Contatar) SUMIU das caixas,
                        // mas os botões de navegação (acima) permanecem.
                        // Se você quiser os títulos nas CAIXAS novamente, descomente o <h3> abaixo.
                        // Na imagem, as caixas são mais simples.
                        className="flex-shrink-0 w-48 p-3 bg-white rounded-lg shadow-md" // Caixa mais branca, sem inner
                    >
                        {/* Removido o h3 com stage.title daqui para corresponder à imagem */}
                        
                        {/* Corpo da Coluna */}
                        <div className="text-sm text-gray-500 mb-4 p-4 h-24 flex items-center justify-center border-dashed border-2 border-gray-300 rounded">
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