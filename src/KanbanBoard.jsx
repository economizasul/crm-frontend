import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // 🚨 IMPORTAÇÃO CRÍTICA
import axios from 'axios';

// Definição estática das fases do Kanban (Nomes mais curtos para o layout final)
const STAGES = [
    { id: 1, title: 'Para Contatar', color: 'bg-blue-500' },
    { id: 2, title: 'Em Conversação', color: 'bg-yellow-500' },
    { id: 3, title: 'Proposta Enviada', color: 'bg-green-500' },
    { id: 4, title: 'Fechado', color: 'bg-gray-500' },
    { id: 5, title: 'Perdido', color: 'bg-red-500' },
];

const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [activeStage, setActiveStage] = useState(STAGES[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const navigate = useNavigate(); // 🚨 INICIALIZAÇÃO CRÍTICA
    
    // URL CORRETA DA API, CONFIRMADA NAS ETAPAS ANTERIORES
    const API_URL = 'https://crm-app-cnf7.onrender.com/api/leads'; 

    // FUNÇÃO PARA BUSCAR OS LEADS (Com autenticação e redirecionamento)
    useEffect(() => {
        const fetchLeads = async () => {
            const token = localStorage.getItem('userToken'); 

            if (!token) {
                console.error("Token de autenticação não encontrado. Redirecionando para login.");
                setApiError(true);
                setIsLoading(false);
                navigate('/login'); // 🚨 REDIRECIONAMENTO SE NÃO HOUVER TOKEN
                return;
            }

            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                };

                const response = await axios.get(API_URL, config); 
                
                setLeads(response.data); 
                setApiError(false);
            } catch (error) {
                console.error('Erro ao buscar leads:', error.response ? error.response.data : error.message);
                
                // Se for erro de Não Autorizado (401), o token é inválido
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('userToken');
                    navigate('/login'); 
                }
                
                setApiError(true);
            } finally {
                setIsLoading(false); 
            }
        };

        fetchLeads();
    }, [navigate]); 
    
    // Lógica para renderizar a barra de busca (no topo)
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

    // Função para renderizar o corpo da coluna (agora sem títulos duplicados)
    const renderColumnContent = (stageId) => {
        if (isLoading) {
            return <div className="text-center text-gray-400">Carregando...</div>;
        }

        const stageLeads = leads.filter(lead => lead.stageId === stageId);

        if (apiError) {
            // Mensagem de erro dentro da coluna
            return (
                <div className="text-sm text-red-500 text-center mb-4 p-4 h-24 flex items-center justify-center border-dashed border-2 border-red-300 rounded">
                    Erro de conexão.
                </div>
            );
        }
        
        if (stageLeads.length === 0) {
            return (
                <div className="text-sm text-gray-500 mb-4 p-4 h-24 flex items-center justify-center border-dashed border-2 border-gray-300 rounded">
                    Nenhum Lead nesta etapa.
                </div>
            );
        }

        // Renderização dos cards de Lead
        return (
            <div>
                {stageLeads.map(lead => (
                    <div key={lead.id} className="bg-white p-3 mb-2 rounded shadow text-sm border-l-4 border-indigo-500">
                        {lead.name}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-1 p-6">
            
            {/* 🚨 1. BARRA DE PESQUISA NO TOPO */}
            {renderSearchBar()}
            
            {/* Título (Removido para o layout final limpo) */}
            
            {/* Alerta de Erro Grande (Se a API falhar) */}
            {apiError && ( 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                    <FaBolt className="mr-3" />
                    <strong className="font-bold mr-1">Falha ao carregar os dados.</strong>
                    <span className="block sm:inline"> Verifique a API. (Pode ser erro de CORS/Rede)</span>
                </div>
            )}
            
            {/* 🚨 2. ABAS DE FASES HORIZONTAIS (Botões de navegação, corrigido o space-x-6) */}
            <div className="flex flex-wrap space-x-6 mb-6">
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

            {/* 🚨 3. CONTAINER PRINCIPAL DAS COLUNAS DE FASE HORIZONTAL (Corrigido o space-x-6) */}
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-48 p-3 bg-white rounded-lg shadow-md"
                    >
                        {/*ONTEÚDO DA COLUNA (sem título duplicado) */}
                        {renderColumnContent(stage.id)} 
                        
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