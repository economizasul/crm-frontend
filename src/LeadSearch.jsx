// src/LeadSearch.jsx - CÓDIGO CORRIGIDO (APENAS CONTEÚDO)

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FaSearch, FaPlus, FaEdit, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import LeadEditModal from './components/LeadEditModal.jsx'; // Importa o modal
import { STAGES } from './KanbanBoard.jsx'; // Importa os estágios

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';


// Componente Toast (Para feedback de salvamento)
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClass = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-50";
    const typeClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`${baseClass} ${typeClass}`}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                    <FaTimes size={12} />
                </button>
            </div>
        </div>
    );
};

// Componente de Conteúdo (Estrutura da Lista/Tabela)
const LeadSearchContent = ({ isLoading, apiError, navigate, searchTerm, handleSearchChange, filteredLeads, openLeadModal }) => (
    <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Busca de Leads</h1>

        {/* Barra de Ações (Pesquisa e Adicionar) */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
            {/* Barra de Pesquisa */}
            <div className="relative flex-1 w-full md:w-auto md:mr-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
            </div>
            
            {/* Botão Adicionar Lead */}
            <button 
                onClick={() => navigate('/register-lead')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-200 w-full md:w-auto justify-center"
            >
                <FaPlus size={16} />
                <span>Adicionar Novo Lead</span>
            </button>
        </div>

        {/* Exibição de Status */}
        {isLoading && <p className="text-center text-indigo-600">Carregando leads...</p>}
        {apiError && <p className="text-center text-red-600">{apiError}</p>}
        
        {/* Tabela de Leads */}
        {!isLoading && !apiError && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Estágio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Prioridade</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-indigo-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{lead.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{lead.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STAGES[lead.stage] || 'bg-gray-100 text-gray-800'}`}>
                                                {lead.stage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.priority === 'Alta' ? 'bg-red-100 text-red-800' : lead.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {lead.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button 
                                                onClick={() => openLeadModal(lead)}
                                                className="text-indigo-600 hover:text-indigo-900 transition duration-150 p-2 rounded-full hover:bg-indigo-100"
                                                title="Editar"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 italic">
                                        {searchTerm ? 'Nenhum lead encontrado com o termo de busca.' : 'Nenhum lead cadastrado.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
);


// --- COMPONENTE LEAD SEARCH PRINCIPAL ---
const LeadSearch = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    // Estados
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Estados para Modal de Edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // Função para buscar Leads
    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        setApiError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLeads(response.data); 
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            setApiError('Não foi possível carregar a lista de leads. Tente novamente.');
            setLeads([]); 
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);


    // --- Lógica de Pesquisa ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const filteredLeads = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        if (!lowerCaseSearch) {
            return leads;
        }

        return leads.filter(lead => 
            lead.name.toLowerCase().includes(lowerCaseSearch) ||
            (lead.email && lead.email.toLowerCase().includes(lowerCaseSearch)) ||
            (lead.phone && lead.phone.includes(lowerCaseSearch))
        );
    }, [leads, searchTerm]);


    // --- Lógica do Modal de Edição ---
    const showToast = useCallback((message, type) => {
        setToast({ message, type });
    }, []);

    const openLeadModal = useCallback((lead) => {
        // Garantir que 'notes' é um array, mesmo que venha nulo ou indefinido
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
        showToast(message, success ? 'success' : 'error');
    }, [showToast]);


    return (
        // Renderiza APENAS o conteúdo principal.
        <div className="flex-1"> 
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
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