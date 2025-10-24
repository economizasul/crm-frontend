// src/LeadSearch.jsx - CÓDIGO FINAL COM REMOÇÃO DO LAYOUT DUPLICADO

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FaSearch, FaPlus, FaEdit, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
// REMOVIDA: import Sidebar from './components/Sidebar'; 
import LeadEditModal from './components/LeadEditModal';
import { STAGES } from './KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// --- FUNÇÕES AUXILIARES (Modal e Notas) ---
// (Mantenha as funções auxiliares formatNoteDate, LeadEditModalContent e Toast se estiverem no seu arquivo)

// A função formatNoteDate (mantida, pois é usada)
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

// Componente de Conteúdo da Busca (LeadSearchContent) - Otimizado e Memoizado
const LeadSearchContent = React.memo(({ isLoading, apiError, navigate, searchTerm, handleSearchChange, filteredLeads, filterTerm, openLeadModal }) => {
    // ... (O conteúdo da sua busca/listagem - Mantido) ...
    // Seu código de listagem de leads e formulário de busca vai aqui
    // Como você já tinha esse componente separado, vamos apenas garantir que ele esteja correto.
    
    // ATENÇÃO: Se você estava usando o LeadSearchContent como uma função anônima, 
    // certifique-se de que ele foi definido antes (ou use o código completo do seu arquivo, 
    // removendo apenas o layout principal).

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Busca e Listagem de Leads
                <button 
                    onClick={() => navigate('/register-lead')} 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                >
                    <FaPlus /> <span>Novo Lead</span>
                </button>
            </h1>

            <div className="mb-6 flex space-x-4">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Pesquisar por Nome, Telefone ou Email..." 
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {isLoading && <div className="text-center text-indigo-600 mt-10">Carregando leads...</div>}
            {apiError && <div className="text-center text-red-600 mt-10">{apiError}</div>}

            {!isLoading && !apiError && (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.map(lead => (
                                <tr key={lead._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STAGES[lead.status] || STAGES.Novo}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => openLeadModal(lead)}
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                                        >
                                            <FaEdit size={14} /> <span>Editar</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500 italic">
                                        Nenhum lead encontrado com o termo "{searchTerm}".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});


// Componente Principal LeadSearch
const LeadSearch = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    // ... (fetchLeads, openLeadModal, closeLeadModal, handleSaveFeedback - mantidos)

    const fetchLeads = useCallback(async () => {
        // ... (Sua lógica de fetch)
    }, [token, navigate, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredLeads = useMemo(() => {
        // ... (Sua lógica de filtro)
        if (!searchTerm) return leads;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return leads.filter(lead => 
            lead.name.toLowerCase().includes(lowerCaseSearch) ||
            lead.phone.includes(searchTerm) ||
            lead.email.toLowerCase().includes(lowerCaseSearch)
        );
    }, [leads, searchTerm]);

    const openLeadModal = useCallback((lead) => {
        // ... (Sua lógica de abrir modal)
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        fetchLeads(); // Opcional: Recarregar a lista após fechar o modal
    }, [fetchLeads]);
    
    const handleSaveFeedback = useCallback((success, message) => {
        // ... (Sua lógica de feedback)
    }, []);


    return (
        // 🚨 AQUI ESTÁ A MUDANÇA CRÍTICA: REMOVER A DIV DE LAYOUT COMPLETA E O <Sidebar />
        // Agora o componente renderiza APENAS o seu CONTEÚDO principal.
        <main className="flex-1"> 
            {/* Usa o componente memoizado */}
            <LeadSearchContent 
                isLoading={isLoading}
                apiError={apiError}
                navigate={navigate}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                filteredLeads={filteredLeads}
                filterTerm={''} // Não está sendo usado, mas mantido se for relevante em seu código
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
        </main>
    );
};

export default LeadSearch;