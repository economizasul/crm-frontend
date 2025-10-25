// src/LeadSearch.jsx - CÓDIGO FINAL COM LAYOUT E CORES AJUSTADAS PARA O TEMA VERDE

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FaSearch, FaPlus, FaEdit, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import LeadEditModal from './components/LeadEditModal'; 
import { STAGES } from './KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// --- FUNÇÕES AUXILIARES --- (Mantidas)
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

// --- COMPONENTE LEAD SEARCH CONTENT (Ajustado) ---
const LeadSearchContent = React.memo(({
    isLoading, apiError, navigate, searchTerm, handleSearchChange, filteredLeads, openLeadModal
}) => {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Busca de Leads</h1>

            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar Leads por nome, UC, email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        // AJUSTE DE FOCO: indigo-500 -> green-500
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                
                <button
                    onClick={() => navigate('/register-lead')}
                    // AJUSTE DE COR: indigo-600 -> green-600 / hover:bg-indigo-700 -> hover:bg-green-700
                    className="ml-4 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition duration-150"
                >
                    <FaPlus />
                    <span>Cadastrar Novo Lead</span>
                </button>
            </div>

            {isLoading && <div className="text-center text-lg">Carregando Leads...</div>}
            {apiError && <div className="text-center text-red-600">{apiError}</div>}

            {/* Tabela de Resultados */}
            {!isLoading && !apiError && (
                <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UC</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumo Médio (kWh)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.map((lead) => {
                                const statusClass = STAGES[lead.status] || 'bg-gray-100 text-gray-700';
                                return (
                                    <tr key={lead._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.uc}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.avgConsumption}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => openLeadModal(lead)}
                                                // AJUSTE DE COR: indigo-600 -> green-600
                                                className="text-green-600 hover:text-green-900 transition"
                                                title="Editar Lead"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredLeads.length === 0 && searchTerm && (
                        <p className="text-center text-gray-500 p-6">Nenhum lead encontrado com o termo "{searchTerm}".</p>
                    )}
                    {!searchTerm && filteredLeads.length === 0 && !isLoading && (
                        <p className="text-center text-gray-500 p-6">Nenhum lead cadastrado.</p>
                    )}
                </div>
            )}
        </div>
    );
});


// --- COMPONENTE PRINCIPAL LEAD SEARCH ---
const LeadSearch = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const navigate = useNavigate();
    const { token } = useAuth();

    // Fetch Leads (mantida)
    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(response.data.data);
        } catch (err) {
            setApiError('Falha ao carregar leads. Tente novamente mais tarde.');
            console.error('Erro ao carregar leads:', err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Lógica de Busca/Filtro (mantida)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredLeads = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return leads.filter(lead => 
            lead.name.toLowerCase().includes(term) ||
            lead.uc.toLowerCase().includes(term) ||
            lead.email.toLowerCase().includes(term)
        );
    }, [leads, searchTerm]);

    // Lógica do Modal (mantida)
    const openLeadModal = useCallback((lead) => {
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        fetchLeads(); // Recarregar a lista após fechar o modal
    }, [fetchLeads]);
    
    const handleSaveFeedback = useCallback((success, message) => {
        console.log(`Salvamento: ${success ? 'Sucesso' : 'Falha'} - ${message}`);
    }, []);


    return (
        // Renderiza APENAS o conteúdo principal.
        <div className="flex-1"> 
            <LeadSearchContent 
                isLoading={isLoading}
                apiError={apiError}
                navigate={navigate}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                filteredLeads={filteredLeads}
                openLeadModal={openLeadModal}
            />

            {selectedLead && (
                <LeadEditModal 
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