// src/KanbanBoard.jsx - CÓDIGO FINAL COM BARRA DE PESQUISA, FILTRO, MODAL E DRAG/DROP

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaEdit, FaTrash } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import LeadEditModal from './components/LeadEditModal.jsx'; // Importa o modal de edição

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores (Exportado para LeadSearch e LeadEditModal)
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Para Contatar': 'bg-blue-200 text-blue-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
};
const STAGE_ORDER = Object.keys(STAGES);

// Componente simples de Toast para feedback
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

// --- COMPONENTE PRINCIPAL: KANBAN BOARD ---

const KanbanBoard = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // Estados para dados e UI
    const [leads, setLeads] = useState({}); // Leads agrupados por estágio
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Estados para Modal de Edição (novo)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // Função para exibir o Toast
    const showToast = useCallback((message, type) => {
        setToast({ message, type });
    }, []);

    // Função principal para buscar Leads
    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        setApiError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads/kanban`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // O backend deve retornar um objeto com os estágios
            setLeads(response.data); 
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            setApiError('Não foi possível carregar os leads. Tente novamente.');
            setLeads({}); // Limpa leads em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // --- Lógica de Pesquisa e Filtro ---
    const filteredLeads = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        // Se a busca for vazia, retorna os leads originais
        if (!lowerCaseSearch) {
            return leads;
        }

        // Cria um novo objeto de leads filtrados
        const filtered = {};
        for (const stage in leads) {
            if (leads[stage] && leads[stage].length > 0) {
                // Filtra os leads dentro de cada estágio
                filtered[stage] = leads[stage].filter(lead => 
                    lead.name.toLowerCase().includes(lowerCaseSearch) ||
                    (lead.email && lead.email.toLowerCase().includes(lowerCaseSearch)) ||
                    (lead.phone && lead.phone.includes(lowerCaseSearch))
                );
            }
        }
        return filtered;
    }, [leads, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // --- Lógica de Drag and Drop (D&D) ---
    const handleDragStart = (e, leadId, stage) => {
        e.dataTransfer.setData('leadId', leadId);
        e.dataTransfer.setData('sourceStage', stage);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = useCallback(async (e, targetStage) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        const sourceStage = e.dataTransfer.getData('sourceStage');

        // Ignora se for a mesma coluna
        if (sourceStage === targetStage) return;

        // 1. Atualização Otimista da UI
        setLeads(prevLeads => {
            const newLeads = { ...prevLeads };
            
            // Encontra o lead na coluna de origem
            const leadIndex = newLeads[sourceStage].findIndex(l => l.id.toString() === leadId.toString());
            if (leadIndex === -1) return prevLeads; // Não encontrado
            
            const [movedLead] = newLeads[sourceStage].splice(leadIndex, 1);
            
            // Atualiza o estágio do lead
            const updatedLead = { ...movedLead, stage: targetStage };
            
            // Adiciona o lead à coluna de destino (no topo)
            newLeads[targetStage] = [updatedLead, ...(newLeads[targetStage] || [])];
            
            return newLeads;
        });

        // 2. Chamada à API para persistir a mudança
        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}/stage`, { new_stage: targetStage }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Lead ${leadId} movido para ${targetStage} com sucesso!`, 'success');
        } catch (error) {
            console.error('Erro ao atualizar estágio do lead:', error);
            showToast('Erro ao mover o lead. Recarregue a página.', 'error');
            // Reverter a UI em caso de erro na API:
            fetchLeads(); 
        }
    }, [token, fetchLeads, showToast]);

    // --- Lógica do Modal de Edição (Novo) ---
    const openLeadModal = useCallback((lead) => {
        // Garantir que 'notes' é um array, mesmo que venha nulo ou indefinido do backend
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        // Recarregar a lista após fechar o modal, garantindo que as alterações (notas ou dados) sejam refletidas.
        fetchLeads(); 
    }, [fetchLeads]);

    // Ação ao clicar no botão "Editar" no card
    const handleEditClick = (e, lead) => {
        e.stopPropagation(); // Evita que o evento de d&d seja disparado
        openLeadModal(lead);
    };

    const handleSaveFeedback = useCallback((success, message) => {
        showToast(message, success ? 'success' : 'error');
    }, [showToast]);


    // --- Renderização ---
    if (isLoading && !Object.keys(leads).length) {
        return <div className="p-4 text-center">Carregando leads...</div>;
    }

    if (apiError) {
        return <div className="p-4 text-center text-red-600">{apiError}</div>;
    }

    return (
        <div className="p-4 h-full">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Barra de Ações (Pesquisa e Adicionar) */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-gray-800">Kanban Board</h1>
                
                <div className="flex space-x-3 w-full md:w-auto">
                    {/* Barra de Pesquisa */}
                    <div className="relative flex-1">
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
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-200"
                    >
                        <FaPlus size={16} />
                        <span className="hidden sm:inline">Adicionar Lead</span>
                    </button>
                </div>
            </div>

            {/* Container do Kanban */}
            {/* O pb-4 garante espaço para a barra de rolagem horizontal */}
            <div className="flex overflow-x-auto overflow-y-hidden space-x-4 pb-4 h-full max-h-[calc(100vh-140px)]"> 
                {STAGE_ORDER.map((stage) => (
                    <div 
                        key={stage} 
                        className="flex-shrink-0 w-64 md:w-72 lg:w-80" // Largura ajustável
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage)}
                    >
                        {/* Header da Coluna */}
                        <div className={`p-3 rounded-t-lg font-semibold text-sm uppercase text-center ${STAGES[stage]} shadow-md sticky top-0 z-10`}>
                            {stage} ({filteredLeads[stage]?.length || 0})
                        </div>

                        {/* Corpo da Coluna */}
                        <div className="bg-white p-2 rounded-b-lg shadow-lg h-full overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}> 
                            {filteredLeads[stage]?.map(lead => (
                                <div 
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id, stage)}
                                    className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm hover:shadow-md transition duration-150 cursor-grab"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-gray-900 text-base mb-1">{lead.name}</h3>
                                        {/* Botão de Edição Rápida */}
                                        <button 
                                            onClick={(e) => handleEditClick(e, lead)}
                                            className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-gray-100 transition"
                                            title="Editar Lead"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{lead.email}</p>
                                    <p className="text-sm text-gray-600">{lead.phone}</p>
                                    <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${lead.priority === 'Alta' ? 'bg-red-100 text-red-800' : lead.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {lead.priority}
                                    </span>
                                </div>
                            )) || <p className="text-center text-gray-500 italic mt-4">Nenhum lead encontrado.</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Renderiza o Modal de Edição */}
            {selectedLead && (
                <LeadEditModal 
                    selectedLead={selectedLead} 
                    isModalOpen={isModalOpen} 
                    onClose={closeLeadModal} 
                    onSave={handleSaveFeedback}
                    token={token} 
                    fetchLeads={fetchLeads} // Passa a função para o modal
                />
            )}
        </div>
    );
};

export default KanbanBoard;