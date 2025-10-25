// src/KanbanBoard.jsx - CÓDIGO FINAL COM BARRA DE PESQUISA, FILTRO, MODAL E DRAG/DROP (Layout Atualizado)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import LeadEditModal from './components/LeadEditModal'; // Se o modal não estiver no próprio Kanban, mantenha o import
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores (mantidas para funcionalidade, mas o layout foi ajustado)
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Para Contatar': 'bg-blue-200 text-blue-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
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

// Componente Lead Card (ajustado visualmente)
const LeadCard = ({ lead, openLeadModal, moveLead, stage }) => {
    // Implementação de Drag and Drop para o Card
    const [{ isDragging }, drag] = useDrag({
        type: 'LEAD',
        item: { id: lead.id, currentStage: stage },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const isUrgent = lead.status === 'Retorno Agendado' || lead.status === 'Em Negociação';

    return (
        <div 
            ref={drag} 
            onClick={() => openLeadModal(lead)}
            // CLASSE ATUALIZADA: Borda e sombra limpas, usando a cor da etapa como um pequeno acento.
            className={`
                bg-white p-3 rounded-lg shadow-md mb-3 cursor-pointer 
                hover:shadow-lg transition-shadow duration-300 transform hover:scale-[1.01]
                border-l-4 ${isUrgent ? 'border-red-500' : 'border-indigo-400'}
                ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
        >
            <h4 className="font-semibold text-sm text-gray-800 truncate" title={lead.name}>{lead.name}</h4>
            <p className="text-xs text-gray-600 mt-1">{lead.phone || 'Sem Telefone'}</p>
            {lead.email && <p className="text-xs text-gray-500 truncate">{lead.email}</p>}
        </div>
    );
};

// Componente Lead Column (ajustado visualmente)
const LeadColumn = ({ stage, leads, openLeadModal, moveLead }) => {
    const stageClass = STAGES[stage] || 'bg-gray-200 text-gray-800';

    // Implementação de Drag and Drop para a Coluna (Drop Target)
    const [, drop] = useDrop({
        accept: 'LEAD',
        drop: (item, monitor) => {
            if (item.currentStage !== stage) {
                moveLead(item.id, stage);
            }
        },
    });

    return (
        // CLASSE ATUALIZADA: Fundo do Kanban mais clean. Colunas mais finas (w-60).
        <div ref={drop} className="w-60 flex-shrink-0 mx-2 p-3 bg-gray-50 rounded-xl shadow-inner border border-gray-200 h-full overflow-y-auto">
            
            {/* Título da Coluna */}
            <h3 className={`font-bold text-sm uppercase p-2 rounded-lg text-center ${stageClass} mb-4 shadow-sm`}>
                {stage} ({leads.length})
            </h3>
            
            {/* Cards */}
            <div className="space-y-3">
                {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} openLeadModal={openLeadModal} moveLead={moveLead} stage={stage} />
                ))}
                {leads.length === 0 && (
                    <p className="text-center text-gray-400 text-sm italic mt-8">Nenhum lead nesta etapa.</p>
                )}
            </div>
        </div>
    );
};

// Componente Principal KanbanBoard
const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }

    // Modal de Edição de Lead
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const navigate = useNavigate();
    const { token } = useAuth();
    
    // --- Lógica de Fetch e Atualização (MANTIDA) ---

    const fetchLeads = useCallback(async () => {
        if (!token) {
            setApiError('Usuário não autenticado.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            // Busca todos os leads para o Kanban
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

    // Função para mover o lead entre as colunas (Drag/Drop)
    const moveLead = useCallback(async (leadId, newStage) => {
        const leadToMove = leads.find(l => l.id === leadId);
        if (!leadToMove || leadToMove.status === newStage) return;

        // 1. Atualização otimista na UI
        const prevStatus = leadToMove.status;
        setLeads(prevLeads =>
            prevLeads.map(lead =>
                lead.id === leadId ? { ...lead, status: newStage } : lead
            )
        );

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // 2. Chamada à API para persistir a mudança
            await axios.put(
                `${API_BASE_URL}/api/v1/leads/${leadId}`,
                { status: newStage },
                config
            );
            setToast({ message: `Lead "${leadToMove.name}" movido para ${newStage}.`, type: 'success' });

        } catch (error) {
            console.error('Erro ao atualizar status do lead:', error);
            setToast({ message: 'Erro ao mover o lead. Revertendo alteração.', type: 'error' });
            
            // 3. Reversão em caso de falha
            setLeads(prevLeads =>
                prevLeads.map(lead =>
                    lead.id === leadId ? { ...lead, status: prevStatus } : lead
                )
            );
        }
    }, [leads, token]);


    // Filtragem de Leads (MANTIDA)
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

    const groupedLeads = useMemo(() => {
        return Object.keys(STAGES).reduce((acc, stage) => {
            acc[stage] = filteredLeads.filter(lead => lead.status === stage);
            return acc;
        }, {});
    }, [filteredLeads]);


    // Lógica do Modal de Edição (MANTIDA)

    const openLeadModal = useCallback((lead) => {
        // Garantir que as notas sejam um array, mesmo que venha nulo/undefined da API
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        fetchLeads(); // Recarrega a lista após fechar o modal
    }, [fetchLeads]);

    const handleSaveFeedback = useCallback((success, message) => {
        if (success) {
            setToast({ message: message || 'Lead atualizado com sucesso!', type: 'success' });
        } else {
            setToast({ message: message || 'Falha ao salvar o lead.', type: 'error' });
        }
    }, []);


    // --- Renderização do Componente ---

    if (isLoading) {
        // LAYOUT ATUALIZADO: Usando o tema de cores Indigo
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
        // LAYOUT ATUALIZADO: Usando o tema de cores Indigo/Vermelho
        return (
            <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Erro ao Carregar Dados</h2>
                <p>{apiError}</p>
                <button 
                    onClick={fetchLeads} 
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        // O Dashboard já fornece o padding superior e lateral.
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-full">
                
                {/* Cabeçalho da Página (Atualizado) */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-lg mb-6">
                    <h1 className="text-3xl font-extrabold text-indigo-800 mb-3 md:mb-0">Pipeline de Leads</h1>
                    
                    <div className="flex space-x-3 w-full md:w-auto">
                        {/* Campo de Busca (Atualizado) */}
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Buscar por Nome, Email, Telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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

                {/* Área do Kanban Board (Scroll Horizontal) */}
                <div className="flex overflow-x-auto overflow-y-hidden space-x-4 pb-4 h-[calc(100vh-180px)]">
                    {Object.keys(groupedLeads).map(stage => (
                        <LeadColumn 
                            key={stage}
                            stage={stage}
                            leads={groupedLeads[stage]}
                            openLeadModal={openLeadModal}
                            moveLead={moveLead}
                        />
                    ))}
                </div>

                {/* Modal de Edição (se estiver aberto) */}
                {selectedLead && (
                    <LeadEditModal 
                        selectedLead={selectedLead}
                        isModalOpen={isModalOpen}
                        onClose={closeLeadModal}
                        onSave={handleSaveFeedback}
                        token={token}
                        fetchLeads={fetchLeads} // Passar fetchLeads para atualizar após o salvamento
                    />
                )}
                
                {/* Toast de Feedback */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </DndProvider>
    );
};

export default KanbanBoard;