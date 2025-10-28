// src/KanbanBoard.jsx - CÓDIGO FINAL: colunas 50% menores + tudo corrigido

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Para Contatar': 'bg-blue-200 text-blue-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
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

// =============================
// Card de Lead (ID SEGURO)
// =============================
const LeadCard = React.memo(({ lead, index, openLeadModal }) => {
    const statusClass = STAGES[lead.status] || 'bg-gray-100 text-gray-700';
    const leadId = lead.id ?? lead._id ?? `temp-${index}`;

    return (
        <Draggable draggableId={String(leadId)} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => openLeadModal(lead)}
                    className="p-3 mb-3 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                >
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {lead.name || 'Sem Nome'}
                    </div>
                    <p className="text-xs text-gray-500">{lead.phone || 'Sem Telefone'}</p>
                    <div className={`mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusClass}`}>
                        {lead.status || 'Sem Status'}
                    </div>
                </div>
            )}
        </Draggable>
    );
});
LeadCard.displayName = 'LeadCard';

// ================================
// Coluna Kanban (LARGURA REDUZIDA ~50%)
// ================================
const KanbanColumn = React.memo(({ stageName, leads, openLeadModal }) => {
    const statusClass = STAGES[stageName] || 'bg-gray-100 text-gray-700';

    return (
        <Droppable droppableId={stageName}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 min-w-[180px] max-w-[240px] bg-gray-50 border border-gray-200 rounded-xl flex flex-col mx-1 p-2 shadow-inner"
                >
                    {/* Título da Coluna */}
                    <div className={`sticky top-0 p-2 mb-2 rounded-lg text-center font-bold text-xs ${statusClass} shadow-md`}>
                        {stageName} ({leads.length})
                    </div>
                    
                    {/* Lista de Cards */}
                    <div className="flex-grow overflow-y-auto">
                        {leads.map((lead, index) => (
                            <LeadCard 
                                key={lead.id ?? lead._id ?? `temp-${index}`} 
                                lead={lead} 
                                index={index} 
                                openLeadModal={openLeadModal}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    );
});
KanbanColumn.displayName = 'KanbanColumn';

// ================================
// Modal de Edição de Lead
// ================================
const LeadEditModal = ({ selectedLead, isModalOpen, onClose, token, fetchLeads, stages }) => {
    const [formData, setFormData] = useState({});
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [noteError, setNoteError] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (selectedLead) {
            const initialNotes = Array.isArray(selectedLead.notes) 
                ? selectedLead.notes 
                : (selectedLead.notes ? [{ text: selectedLead.notes, timestamp: new Date().getTime() }] : []);
            
            setFormData({
                ...selectedLead,
                notes: initialNotes,
            });
            setNoteError('');
        }
    }, [selectedLead]);

    const formatNoteDate = (timestamp) => {
        if (!timestamp) return 'Sem Data';
        try {
            const date = new Date(timestamp);
            return isNaN(date.getTime()) ? 'Data Inválida' : new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false,
            }).format(date);
        } catch {
            return 'Data Inválida';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNote = () => {
        if (newNote.trim().length < 5) {
            setNoteError('A nota deve ter pelo menos 5 caracteres.');
            return;
        }
        setNoteError('');
        
        const noteToAdd = {
            text: newNote.trim(),
            timestamp: new Date().getTime(),
            user: formData.owner_name || 'Usuário Atual'
        };

        setFormData(prev => ({
            ...prev,
            notes: [...prev.notes, noteToAdd]
        }));
        setNewNote('');
    };

    const saveLeadChanges = async () => {
        setSaving(true);
        setToast(null);

        const dataToSave = {
            ...formData,
            notes: JSON.stringify(formData.notes),
            id: undefined, 
            owner_name: undefined,
            created_at: undefined,
            updated_at: undefined,
        };

        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${formData.id ?? formData._id}`, dataToSave, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setToast({ message: 'Lead salvo com sucesso!', type: 'success' });
            fetchLeads();
            onClose();

        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            setToast({ message: 'Falha ao salvar o lead. Tente novamente.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (!isModalOpen || !selectedLead) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-40 p-4 transition-opacity duration-300">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-indigo-700">{selectedLead.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Detalhes Principais</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Atual</label>
                                <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${STAGES[selectedLead.status]}`}>
                                    {selectedLead.status}
                                </span>
                            </div>

                            {['name', 'email', 'phone', 'address', 'uc'].map(field => (
                                <div key={field}>
                                    <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                                        {field === 'name' ? 'Nome' : field === 'phone' ? 'Telefone' : field === 'address' ? 'Endereço' : field.toUpperCase()}
                                    </label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={formData[field] || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                        required={field === 'name' || field === 'phone'}
                                    />
                                </div>
                            ))}

                            {['avg_consumption', 'estimated_savings'].map(field => (
                                <div key={field}>
                                    <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                                        {field === 'avg_consumption' ? 'Consumo Médio (kWh)' : 'Economia Estimada (R$)'}
                                    </label>
                                    <input
                                        type="number"
                                        name={field}
                                        value={formData[field] || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                        step="0.01"
                                    />
                                </div>
                            ))}

                            <div>
                                <label htmlFor="qsa" className="block text-sm font-medium text-gray-700">QSA</label>
                                <textarea
                                    name="qsa"
                                    rows="3"
                                    value={formData.qsa || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                ></textarea>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Notas do Lead</h3>
                            
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 mb-2">Adicionar Nova Nota</label>
                                <textarea
                                    id="newNote"
                                    rows="2"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                    placeholder="Digite a nova nota aqui..."
                                ></textarea>
                                {noteError && <p className="text-red-500 text-xs mt-1">{noteError}</p>}
                                <button 
                                    onClick={handleAddNote} 
                                    className="mt-2 w-full py-2 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
                                    disabled={!newNote.trim()}
                                >
                                    Adicionar Nota
                                </button>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-gray-800 mb-2 border-b">Histórico ({formData.notes?.length || 0})</h4>
                                <div className="max-h-64 overflow-y-auto p-2 space-y-3 bg-white border rounded-lg">
                                    {formData.notes && formData.notes.length > 0 ? (
                                        [...formData.notes].reverse().map((note, index) => (
                                            <div key={index} className="border-b pb-2 last:border-b-0">
                                                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                                    <span className="font-semibold">{note.user || 'Sistema'}</span>
                                                    <span>{formatNoteDate(note.timestamp)}</span>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p> 
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-2">
                                <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                                <button 
                                    onClick={saveLeadChanges} 
                                    disabled={saving} 
                                    className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center space-x-2"
                                >
                                    <FaSave size={16} />
                                    <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =================================
// Componente Principal KanbanBoard
// =================================
const KanbanBoard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterByStage, setFilterByStage] = useState('Todos');

    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch Leads (ID SEGURO)
    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const formattedLeads = response.data.map(lead => {
                let notesArray = [];
                if (lead.notes && typeof lead.notes === 'string') {
                    try {
                        const parsedNotes = JSON.parse(lead.notes);
                        if (Array.isArray(parsedNotes)) {
                            notesArray = parsedNotes.filter(note => note && note.text);
                        } else {
                            notesArray = [{ text: lead.notes, timestamp: new Date(lead.updated_at).getTime() }];
                        }
                    } catch (e) {
                        notesArray = [{ text: lead.notes, timestamp: new Date(lead.updated_at).getTime() }];
                    }
                } else if (Array.isArray(lead.notes)) {
                    notesArray = lead.notes;
                }
                
                return {
                    ...lead,
                    id: lead.id ?? lead._id ?? null,
                    notes: notesArray,
                    owner_name: lead.owner_name || 'Desconhecido'
                };
            });

            setLeads(formattedLeads);
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            setApiError('Falha ao carregar leads. Tente novamente mais tarde.');
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Drag and Drop (ID SEGURO)
    const onDragEnd = useCallback(async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const leadId = parseInt(draggableId) || parseInt(draggableId.split('-')[1]) || null;
        if (!leadId) return;

        const newStatus = destination.droppableId;
        const updatedLeads = leads.map(lead => 
            (lead.id === leadId || lead._id === leadId) ? { ...lead, status: newStatus } : lead
        );
        setLeads(updatedLeads);

        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ message: `Lead movido para ${newStatus}!`, type: 'success' });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            setLeads(leads);
            setToast({ message: 'Falha ao mover lead.', type: 'error' });
        }
    }, [leads, token]);

    // Filtragem e Agrupamento
    const groupedLeads = useMemo(() => {
        const filtered = leads.filter(lead => {
            const matchesSearch = searchTerm.trim() === '' || 
                Object.values(lead).some(value => 
                    String(value).toLowerCase().includes(searchTerm.toLowerCase().trim())
                );
            const matchesStage = filterByStage === 'Todos' || lead.status === filterByStage;
            const matchesOwner = user?.role === 'Admin' || lead.owner_id === user?.id;
            return matchesSearch && matchesStage && matchesOwner;
        });

        return Object.keys(STAGES).reduce((acc, stage) => {
            acc[stage] = filtered.filter(lead => lead.status === stage);
            return acc;
        }, {});
    }, [leads, searchTerm, filterByStage, user]);

    // Modal
    const openLeadModal = useCallback((lead) => {
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        setSelectedLead({ ...lead, notes: leadNotes });
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
    }, []);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
    const handleFilterChange = useCallback((e) => setFilterByStage(e.target.value), []);

    // Renderização
    if (isLoading) return <div className="p-8 text-center text-lg text-indigo-600">Carregando dados do Kanban...</div>;
    if (apiError) return <div className="p-8 text-center text-red-600 font-bold">{apiError}</div>;

    return (
        <div className="flex-1 flex flex-col p-6 bg-gray-50 h-full overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-xl shadow-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Kanban CRM</h1>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/register-lead')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200 w-full md:w-auto"
                    >
                        <FaPlus />
                        <span>Novo Lead</span>
                    </button>

                    <select
                        value={filterByStage}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white w-full md:w-auto"
                    >
                        <option value="Todos">Filtrar por Estágio...</option>
                        {Object.keys(STAGES).map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>

                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar Lead..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-grow flex overflow-x-auto overflow-y-hidden pb-4 space-x-2">
                    {Object.keys(STAGES).map(stage => (
                        <KanbanColumn
                            key={stage}
                            stageName={stage}
                            leads={groupedLeads[stage] || []}
                            openLeadModal={openLeadModal}
                        />
                    ))}
                </div>
            </DragDropContext>
            
            <LeadEditModal 
                selectedLead={selectedLead}
                isModalOpen={isModalOpen}
                onClose={closeLeadModal}
                token={token}
                fetchLeads={fetchLeads}
                stages={STAGES}
            />
        </div>
    );
};

export default KanbanBoard;