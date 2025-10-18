import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 

// Definição estática das fases do Kanban (omiti por brevidade)
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
    // NOVO ESTADO: Verifica se o token está sendo processado
    const [isTokenVerified, setIsTokenVerified] = useState(false);
    
    const navigate = useNavigate(); 
    const API_URL = 'https://crm-app-cnf7.onrender.com/api/leads'; 

    // EFEITO 1: VERIFICAÇÃO INICIAL DO TOKEN
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            // Se não houver token, redireciona imediatamente e define o estado.
            navigate('/login'); 
        } else {
            // Se o token existir, podemos prosseguir com o fetch.
            setIsTokenVerified(true);
        }
    }, [navigate]);

    // EFEITO 2: BUSCA OS LEADS SOMENTE APÓS A VERIFICAÇÃO DO TOKEN
    useEffect(() => {
        // Só executa se o token foi verificado como existente
        if (!isTokenVerified) return;

        const fetchLeads = async () => {
            const token = localStorage.getItem('userToken'); 
            
            // O token DEVE existir aqui, mas esta é uma checagem de segurança.
            if (!token) {
                // Se por algum motivo o token sumiu, re-redireciona.
                navigate('/login'); 
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
                
                if (error.response && error.response.status === 401) {
                    // Token inválido/expirado, faz logout
                    localStorage.removeItem('userToken');
                    navigate('/login'); 
                }
                setApiError(true);
            } finally {
                setIsLoading(false); 
            }
        };

        fetchLeads();
    }, [navigate, isTokenVerified]); // Depende do isTokenVerified

    // ... (renderSearchBar e renderColumnContent, omitemos por brevidade)

    // Altere a condição de Loading para incluir a verificação do Token
    if (isLoading || !isTokenVerified) { 
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Carregando Dashboard...</p>
            </div>
        );
    }
    
    // ... (resto da renderização do componente)
    
    const renderSearchBar = () => (
        // ... (código da barra de pesquisa)
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
    
    const renderColumnContent = (stageId) => {
        if (isLoading) {
            return <div className="text-center text-gray-400">Carregando...</div>;
        }

        const stageLeads = leads.filter(lead => lead.stageId === stageId);

        if (apiError) {
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

        // Renderização dos cards de Lead (exemplo)
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
            
            {/* BARRA DE PESQUISA */}
            {renderSearchBar()}
            
            {/* ALERTA DE ERRO GERAL */}
            {apiError && ( 
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
                    <FaBolt className="mr-3" />
                    <strong className="font-bold mr-1">Falha ao carregar os dados.</strong>
                    <span className="block sm:inline"> Verifique a API. (Pode ser erro de CORS/Rede)</span>
                </div>
            )}
            
            {/* ABAS DE FASES HORIZONTAIS */}
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

            {/* CONTAINER PRINCIPAL DAS COLUNAS */}
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-48 p-3 bg-white rounded-lg shadow-md"
                    >
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
