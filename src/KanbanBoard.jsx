// src/KanbanBoard.jsx - CÓDIGO COMPLETO COM TEAL

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores (ATUALIZADO PARA TEAL)
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Para Contatar': 'bg-blue-200 text-blue-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
    'Retorno Agendado': 'bg-teal-200 text-teal-800', // COR ALTERADA: indigo -> teal
};

// Componente simples de Toast para feedback
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    return (
        <div className={`p-3 rounded-lg text-white font-medium shadow-lg fixed top-4 right-4 z-50 ${bgColor}`}>
            {message}
        </div>
    );
};

// Componente Card de Lead
const LeadCard = ({ lead, onClick }) => {
    const stageClass = STAGES[lead.stage] || 'bg-gray-200 text-gray-800';
    return (
        <div 
            onClick={() => onClick(lead)}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("leadId", lead.id);
                e.dataTransfer.effectAllowed = "move";
            }}
            className={`bg-white p-3 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer mb-3`}
        >
            <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
            <p className="text-xs text-gray-600 truncate">{lead.email}</p>
            <p className="text-xs text-gray-600 truncate">{lead.phone}</p>
            <div className={`mt-2 text-xs font-medium px-2 py-1 rounded-full text-center ${stageClass}`}>{lead.stage}</div>
        </div>
    );
};

// Hook de Debounce para busca
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};


const KanbanBoard = () => {
    const [leads, setLeads] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    
    // Estados para o Modal de Edição (mantido aqui por conveniência)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadData, setLeadData] = useState({});
    const [saving, setSaving] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState([]);


    const { token } = useAuth();
    const navigate = useNavigate();
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Função para carregar os leads da API
    const fetchLeads = useCallback(async () => {
        if (!token) {
            setApiError("Não autenticado. Por favor, faça login.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setApiError(null);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            
            // Agrupar leads por estágio
            const groupedLeads = Object.keys(STAGES).reduce((acc, stage) => {
                acc[stage] = response.data.filter(lead => lead.stage === stage);
                return acc;
            }, {});

            setLeads(groupedLeads);

        } catch (error) {
            console.error("Erro ao buscar leads:", error.response?.data?.error || error.message);
            setApiError("Erro ao carregar dados. Por favor, tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Filtragem de Leads (incluindo o estado)
    const filteredLeads = useMemo(() => {
        if (!debouncedSearchTerm) {
            return leads;
        }

        const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
        
        return Object.keys(leads).reduce((acc, stage) => {
            acc[stage] = leads[stage].filter(lead =>
                lead.name.toLowerCase().includes(lowerCaseSearch) ||
                lead.email.toLowerCase().includes(lowerCaseSearch) ||
                lead.phone.toLowerCase().includes(lowerCaseSearch)
            );
            return acc;
        }, {});
    }, [leads, debouncedSearchTerm]);

    // Função para mover o card
    const handleDrop = useCallback(async (leadId, targetStage) => {
        const lead = Object.values(leads).flat().find(l => l.id === leadId);
        
        if (!lead || lead.stage === targetStage) return;

        // Atualização otimista da UI
        const oldStage = lead.stage;
        const newLeads = { ...leads };

        newLeads[oldStage] = newLeads[oldStage].filter(l => l.id !== leadId);
        newLeads[targetStage] = [...newLeads[targetStage], { ...lead, stage: targetStage }];

        setLeads(newLeads);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, { stage: targetStage }, config);
            setToast({ message: `Lead '${lead.name}' movido para ${targetStage}!`, type: 'success' });
            // Não é necessário refetch, a atualização otimista é suficiente
        } catch (error) {
            console.error("Erro ao atualizar estágio do lead:", error);
            setToast({ message: `Falha ao mover o lead: ${error.message}`, type: 'error' });

            // Reverter a UI em caso de falha
            const revertedLeads = { ...leads };
            revertedLeads[targetStage] = revertedLeads[targetStage].filter(l => l.id !== leadId);
            revertedLeads[oldStage] = [...revertedLeads[oldStage], lead];
            setLeads(revertedLeads);
        }
    }, [leads, token]);
    
    // --- Lógica do Modal de Edição (Duplicada de LeadEditModal, mas mantida aqui para ser autossuficiente) ---
    
    // Função auxiliar para formatar datas (necessária para as notas)
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
    
    const openLeadModal = useCallback(async (lead) => {
        setSelectedLead(lead);
        
        // Formata as notas para exibição (garante que é um array)
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        setNotes(leadNotes); 
        
        // Define leadData com os dados do lead
        const leadCopy = { 
            name: lead.name || '', 
            email: lead.email || '', 
            phone: lead.phone || '', 
            stage: lead.stage || 'Novo',
            // Adicionar mais campos se necessário
        };
        setLeadData(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        setLeadData({});
        setNewNote('');
        setNotes([]);
        fetchLeads(); // Recarrega a lista para refletir as mudanças
    }, [fetchLeads]);

    const handleDataChange = (e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({ ...prev, [name]: value }));
    };

    // Salvar Alterações
    const saveLeadChanges = async () => {
        if (!selectedLead || saving) return;

        setSaving(true);
        setApiError(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // 1. Atualizar dados do Lead
            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead.id}`, leadData, config);

            // 2. Adicionar nova nota, se houver
            if (newNote.trim()) {
                const notePayload = { text: newNote.trim() };
                await axios.post(`${API_BASE_URL}/api/v1/leads/${selectedLead.id}/notes`, notePayload, config);
            }

            setToast({ message: `Lead '${selectedLead.name}' atualizado com sucesso!`, type: 'success' });
            closeLeadModal();
        } catch (error) {
            console.error("Erro ao salvar lead:", error.response?.data?.error || error.message);
            setApiError("Falha ao salvar. Verifique se todos os campos estão corretos.");
        } finally {
            setSaving(false);
        }
    };
    
    // --- Fim da Lógica do Modal ---


    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Carregando quadro Kanban...</div>;
    }

    if (apiError && !toast) { // Se houver erro e o toast não estiver visível (para evitar dois feedbacks)
        setToast({ message: apiError, type: 'error' });
    }

    return (
        <div className="p-4 min-h-full">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Cabeçalho e Busca */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quadro Kanban</h1>
                <button 
                    onClick={() => navigate('/register-lead')} 
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2" // Botão Novo Lead: bg-teal-600
                >
                    <FaPlus /> <span>Novo Lead</span>
                </button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="mb-6 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar leads por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
            </div>


            {/* Kanban Board */}
            <div className="flex overflow-x-auto space-x-4 pb-4">
                {Object.keys(STAGES).map(stage => {
                    const stageLeads = filteredLeads[stage] || [];
                    const stageClass = STAGES[stage].replace('text-gray-800', 'text-gray-900').replace('bg-gray-200', 'bg-gray-100');
                    const headerClass = STAGES[stage].replace('text-gray-800', 'text-white').replace('bg-gray-200', 'bg-teal-600'); // Fundo do header pode ser ajustado, aqui uso a cor do stage, exceto para 'Novo'

                    return (
                        <div 
                            key={stage} 
                            className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg border border-gray-200"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const leadId = e.dataTransfer.getData("leadId");
                                handleDrop(leadId, stage);
                            }}
                        >
                            <h3 
                                className={`text-lg font-semibold p-3 rounded-t-xl text-center ${stage === 'Novo' ? 'bg-gray-200 text-gray-800' : headerClass}`}
                                style={stage === 'Novo' ? {} : {backgroundColor: STAGES[stage].split(' ')[0].replace('bg-', '#') + '50', color: STAGES[stage].split(' ')[1].replace('text-', '#') + '00'}}
                            >
                                {stage} ({stageLeads.length})
                            </h3>
                            <div className="p-3 space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto">
                                {stageLeads.length > 0 ? (
                                    stageLeads.map(lead => (
                                        <LeadCard key={lead.id} lead={lead} onClick={openLeadModal} />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm italic p-2 text-center">Nenhum lead neste estágio.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Edição de Lead (Integrado no KanbanBoard) */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
                        
                        {/* Cabeçalho do Modal */}
                        <div className="flex justify-between items-start border-b pb-4 mb-4">
                            <h2 className="text-2xl font-semibold text-teal-600">Detalhes do Lead: {selectedLead.name}</h2> {/* TÍTULO: text-teal-600 */}
                            <button onClick={closeLeadModal} className="text-gray-400 hover:text-gray-600">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Corpo do Modal - Formulário */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coluna 1: Dados do Lead */}
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-teal-600">Dados Principais</h3> {/* SUBTÍTULO: text-teal-600 */}
                                
                                {/* Nome */}
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                                    <input type="text" id="name" name="name" value={leadData.name} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                                </div>
                                
                                {/* Email */}
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" id="email" name="email" value={leadData.email} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                                </div>
                                
                                {/* Telefone */}
                                <div className="mb-4">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                                    <input type="text" id="phone" name="phone" value={leadData.phone} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                                </div>

                                {/* Estágio */}
                                <div className="mb-4">
                                    <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Estágio</label>
                                    <select id="stage" name="stage" value={leadData.stage} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                        {Object.keys(STAGES).map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Coluna 2: Notas */}
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-teal-600">Notas</h3> {/* SUBTÍTULO: text-teal-600 */}
                                
                                {/* Adicionar Nota */}
                                <div className="mb-4">
                                    <textarea
                                        rows="2"
                                        placeholder="Adicione uma nova nota..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    {/* Nota será salva junto com as alterações do Lead */}
                                </div>

                                {/* Lista de Notas Existentes */}
                                <div className="space-y-4 max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50">
                                    {notes.length > 0 ? (
                                        notes.map((note, index) => (
                                            <div key={index} className="border-b pb-2 last:border-b-0">
                                                <p className="font-semibold text-xs text-teal-600">{formatNoteDate(note.timestamp)}</p> {/* DATA DA NOTA: text-teal-600 */}
                                                <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p> 
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botões do Modal */}
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={closeLeadModal} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                            <button 
                                onClick={saveLeadChanges} 
                                disabled={saving} 
                                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 flex items-center space-x-2" // BOTÃO SALVAR: bg-teal-600
                            >
                                <FaSave size={16} />
                                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;