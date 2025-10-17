import React, { useState, useEffect } from 'react';
import { FaSearch, FaBolt } from 'react-icons/fa';
// 🚨 ATENÇÃO A ESTA IMPORTAÇÃO: Certifique-se de que é importada do react-router-dom
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 

// Definição estática das fases do Kanban
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
    
    // 🚨 AQUI O HOOK DEVE SER INICIALIZADO
    const navigate = useNavigate(); 
    
    // URL CORRETA DA API
    const API_URL = 'https://crm-app-cnf7.onrender.com/api/leads'; 

    // FUNÇÃO PARA BUSCAR OS LEADS (Com autenticação e redirecionamento)
    useEffect(() => {
        const fetchLeads = async () => {
            const token = localStorage.getItem('userToken'); 

            if (!token) {
                console.error("Token de autenticação não encontrado. Redirecionando para login.");
                setApiError(true);
                setIsLoading(false);
                // 🚨 AQUI O REDIRECIONAMENTO É CHAMADO
                navigate('/login'); 
                return;
            }
            // ... (Resto da lógica de try/catch do axios)
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
                    localStorage.removeItem('userToken');
                    navigate('/login'); 
                }
                setApiError(true);
            } finally {
                setIsLoading(false); 
            }
        };

        fetchLeads();
    }, [navigate]); // navigate é uma dependência correta

    // ... (renderSearchBar e renderColumnContent, mantendo o layout limpo)

    const renderSearchBar = () => (/* ... código da barra de busca ... */);
    const renderColumnContent = (stageId) => (/* ... código do corpo da coluna ... */);


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