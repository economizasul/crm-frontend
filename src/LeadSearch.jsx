// src/LeadSearch.jsx - CÓDIGO FINAL COM LAYOUT ATUALIZADO (Apenas Conteúdo)

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FaSearch, FaPlus, FaEdit, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import LeadEditModal from './components/LeadEditModal';
import { STAGES } from './KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// --- FUNÇÕES AUXILIARES (Modal e Notas) ---

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

// Componente simples de Toast para feedback (mantido)
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClass = "fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl text-white transition-opacity duration-300";
    const typeClass = type === 'error' ? 'bg-red-600' : 'bg-green-600';

    return (
        <div className={`${baseClass} ${typeClass}`}>
            <div className="flex items-center space-x-2">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 font-bold">
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

// Componente para o Conteúdo da Busca (desacoplado do Layout)
const LeadSearchContent = ({ isLoading, apiError, navigate, searchTerm, handleSearchChange, filteredLeads, openLeadModal }) => {
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[50vh]">
                <div className="flex items-center space-x-2 text-indigo-600">
                    <FaTimes className="animate-spin text-xl" />
                    <span className="text-lg">Carregando Leads...</span>
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Erro ao Carregar Dados</h2>
                <p>{apiError}</p>
            </div>
        );
    }
    
    const leadCount = filteredLeads.length;

    return (
        <div className="p-4 sm:p-0">
             {/* Cabeçalho da Página (Atualizado) */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-lg mb-6">
                <h1 className="text-3xl font-extrabold text-indigo-800 mb-3 md:mb-0">Buscar e Gerenciar Leads ({leadCount})</h1>
                
                <div className="flex space-x-3 w-full md:w-auto">
                    {/* Campo de Busca (Atualizado) */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar por Nome, Email, Telefone..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Botão Cadastrar Novo Lead (Atualizado com cor Indigo) */}
                    <button
                        onClick={() => navigate('/register-lead')}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
                    >
                        <FaPlus size={16} />
                        <span>Novo Lead</span>
                    </button>
                </div>
            </header>

            {/* Tabela de Leads (Atualizada) */}
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600 hidden sm:table-cell">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600 hidden md:table-cell">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600 hidden lg:table-cell">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-indigo-600">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-indigo-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredLeads.map((lead, index) => (
                            // Efeito de linha zebrada mais sutil
                            <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition duration-150`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">{lead.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell truncate max-w-xs">{lead.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{lead.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{lead.company}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span 
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STAGES[lead.status] || 'bg-gray-400 text-white'}`}
                                    >
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openLeadModal(lead)}
                                        // Botão de ação com tema Indigo
                                        className="text-indigo-600 hover:text-indigo-900 transition duration-150 p-2 rounded-full hover:bg-indigo-100"
                                        title="Editar Lead"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {leadCount === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500 italic">
                                    Nenhum lead encontrado com o termo de busca.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// Componente Principal LeadSearch (Mantém a Lógica Operacional)
const LeadSearch = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Modal de Edição de Lead
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // Lógica de Fetch Leads (MANTIDA)
    const fetchLeads = useCallback(async () => {
        if (!token) {
            setApiError('Usuário não autenticado.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            setLeads(response.data);
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            setApiError('Não foi possível carregar os leads. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Lógica de Busca (MANTIDA)
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredLeads = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        if (!lowerCaseSearch) return leads;
        
        return leads.filter(lead =>
            (lead.name && lead.name.toLowerCase().includes(lowerCaseSearch)) ||
            (lead.email && lead.email.toLowerCase().includes(lowerCaseSearch)) ||
            (lead.phone && lead.phone.includes(lowerCaseSearch)) ||
            (lead.company && lead.company.toLowerCase().includes(lowerCaseSearch))
        );
    }, [leads, searchTerm]);


    // Lógica do Modal de Edição (MANTIDA)
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
        if (success) {
            setToast({ message: message || 'Lead atualizado com sucesso!', type: 'success' });
        } else {
            setToast({ message: message || 'Falha ao salvar o lead.', type: 'error' });
        }
    }, []);


    // Renderiza APENAS o conteúdo principal.
    return (
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
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default LeadSearch;