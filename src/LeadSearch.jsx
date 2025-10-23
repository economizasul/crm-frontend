// src/LeadSearch.jsx - CÓDIGO FINAL COM LAYOUT, EDIÇÃO E CORREÇÃO DE FOCO VIA DEBOUNCE E REFACTOR

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import Sidebar from './components/Sidebar'; 
import LeadEditModal from './components/LeadEditModal'; // <--- AGORA IMPORTA O COMPONENTE EXTERNO
import { STAGES } from './KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// --- FUNÇÕES AUXILIARES (Deixadas aqui apenas se usadas em outro lugar) ---

const formatNoteDate = (timestamp) => {
    if (timestamp === 0 || !timestamp) return 'Sem Data';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Data Inválida';
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(date);
    } catch (e) {
        return 'Erro de Formato';
    }
};

// NOVO COMPONENTE: Extraído para evitar re-renderizações desnecessárias do Input
const LeadSearchContent = React.memo(({ 
    isLoading, apiError, navigate, 
    searchTerm, handleSearchChange, 
    filteredLeads, filterTerm, 
    openLeadModal 
}) => {
    if (isLoading) return <div className="p-6 text-center text-indigo-600">Carregando Leads...</div>;
    if (apiError) return <div className="p-6 text-center text-red-600 font-bold">Erro: {apiError}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            
            {/* Botão de voltar para Kanban Leads */}
            <div className="mb-4">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                >
                    &larr; <span>Voltar para Kanban Leads</span>
                </button>
            </div>

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">Busca e Lista de Leads</h1>
                <button 
                    onClick={() => navigate('/leads/cadastro')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                    <FaPlus size={14} />
                    <span>Novo Lead</span>
                </button>
            </div>
            
            {/* Campo de Busca */}
            <div className="mb-6 relative max-w-lg">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por Nome, Telefone, Documento, UC ou Status..." 
                    value={searchTerm} 
                    onChange={(e) => handleSearchChange(e.target.value)} 
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                />
            </div>
            
            {/* Tabela/Lista de Leads */}
            <div className="bg-white p-4 rounded-lg shadow-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <tr key={lead._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.uc || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'Fechado' ? 'bg-green-100 text-green-800' : lead.status === 'Perdido' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.origin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => openLeadModal(lead)} 
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                                        >
                                            <FaEdit size={14} />
                                            <span>Editar</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                {filterTerm.trim() ? "Nenhum lead encontrado com o termo de busca." : "Nenhum lead cadastrado ou encontrado."}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
                Total de Leads exibidos: {filteredLeads.length}
            </div>
        </div>
    );
});


// --- COMPONENTE PRINCIPAL LEAD SEARCH ---
const LeadSearch = () => {
    const [allLeads, setAllLeads] = useState([]); 
    
    // Estados Debounced
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterTerm, setFilterTerm] = useState(''); 
    
    const [apiError, setApiError] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 
    
    // Função de Busca de Leads 
    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) { setIsLoading(false); return; }
        setIsLoading(true); setApiError(null);
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            setAllLeads(response.data);
            setApiError(null);
        } catch (error) {
            if (error.response?.status === 401) { logout(); setApiError('Sessão expirada. Faça login novamente.'); } 
            else { setApiError('Falha ao carregar leads. Verifique a conexão com a API.'); }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // EFEITO DEBOUNCE 
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilterTerm(searchTerm);
        }, 300); 

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); 

    // useMemo para filtragem 
    const filteredLeads = useMemo(() => {
        const term = filterTerm.trim(); 
        if (!term) {
            return allLeads;
        }

        const lowerCaseTerm = term.toLowerCase();

        return allLeads.filter(lead => {
            const matchName = lead.name?.toLowerCase().includes(lowerCaseTerm);
            const matchPhone = lead.phone?.includes(term); 
            const matchDocument = lead.document?.includes(term);
            const matchEmail = lead.email?.toLowerCase().includes(lowerCaseTerm);
            const matchStatus = lead.status?.toLowerCase().includes(lowerCaseTerm);
            const matchUC = lead.uc?.includes(term);
            const matchOrigin = lead.origin?.toLowerCase().includes(lowerCaseTerm);
            
            return matchName || matchPhone || matchDocument || matchEmail || matchStatus || matchUC || matchOrigin;
        });
    }, [allLeads, filterTerm]);

    // Função de mudança do input 
    const handleSearchChange = (term) => {
        setSearchTerm(term);
    };

    // Funções do Modal 
    const openLeadModal = useCallback((lead) => {
        // Formata as notas para a estrutura que o Modal espera (objetos)
        const leadNotes = Array.isArray(lead.notes) 
            ? lead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
            : [];
            
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
    }, []);
    
    const handleSaveFeedback = useCallback((success, message) => {
        console.log(`Salvamento: ${success ? 'Sucesso' : 'Falha'} - ${message}`);
    }, []);


    return (
        <div className="flex h-screen bg-gray-100"> 
            <Sidebar /> 
            
            <main className="flex-1 overflow-y-auto"> 
                <LeadSearchContent 
                    isLoading={isLoading}
                    apiError={apiError}
                    navigate={navigate}
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                    filteredLeads={filteredLeads}
                    filterTerm={filterTerm}
                    openLeadModal={openLeadModal}
                />
            </main>

            {selectedLead && (
                <LeadEditModal // <--- USA O COMPONENTE IMPORTADO
                    selectedLead={selectedLead}
                    isModalOpen={isModalOpen}
                    onClose={closeLeadModal}
                    onSave={handleSaveFeedback}
                    token={token}
                    fetchLeads={fetchLeads}
                />
            )}
        </div>
    );
};

export default LeadSearch;