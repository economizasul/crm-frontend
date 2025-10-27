// src/KanbanBoard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores (Mantidos)
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Para Contatar': 'bg-blue-200 text-blue-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
};

// Componente simples de Toast para feedback (Mantido)
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

// Componente para formatação da data de atualização (Mantido)
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

// Componente do Cartão (Draggable) (Mantido)
const LeadCard = React.memo(({ lead, index, openLeadModal }) => {
    const stageColorClass = STAGES[lead.status] || STAGES['Novo'];

    return (
        <Draggable draggableId={String(lead._id)} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-3 bg-white rounded-lg shadow-md mb-3 cursor-pointer hover:shadow-lg transition duration-150"
                    onClick={() => openLeadModal(lead)} 
                >
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${stageColorClass}`}>
                        {lead.status}
                    </div>
                    <h3 className="font-bold text-gray-800 mt-1 truncate">{lead.name}</h3>
                    {/* Exibe o nome do proprietário, útil para Admins */}
                    <p className="text-sm text-gray-600">
                        {lead.ownerName ? lead.ownerName : lead.phone} 
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Atualizado: {formatNoteDate(lead.updated_at ? new Date(lead.updated_at).getTime() : 0)}
                    </p>
                </div>
            )}
        </Draggable>
    );
});


const KanbanBoard = () => {
    const [leads, setLeads] = useState({});
    const [allLeadsList, setAllLeadsList] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    
    const [selectedLead, setSelectedLead] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Estados para o Modal de Edição no Kanban
    const [modalFormData, setModalFormData] = useState({});
    const [users, setUsers] = useState([]); 

    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'Admin';
    
    const stageKeys = useMemo(() => Object.keys(STAGES), []);

    const showToast = useCallback((message, type) => {
        setToast({ message, type });
    }, []);

    const fetchLeads = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setApiError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setAllLeadsList(response.data); 
            
        } catch (err) {
            console.error("Erro ao buscar leads:", err.response?.data || err.message);
            setApiError('Falha ao carregar leads. Verifique a conexão.');
            if (err.response && err.response.status === 401) {
                 logout();
            }
        } finally {
            setIsLoading(false); 
        }
    }, [token, logout]);

    const fetchUsers = useCallback(async () => {
        if (!isAdmin || !token) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads/users/reassignment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("Erro ao buscar usuários:", err.response?.data || err.message);
        }
    }, [isAdmin, token]);
    
    useEffect(() => {
        fetchLeads();
        fetchUsers();
    }, [fetchLeads, fetchUsers]);

    useEffect(() => {
        const grouped = stageKeys.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {});
        
        allLeadsList.forEach(lead => {
            if (grouped[lead.status]) {
                grouped[lead.status].push(lead);
            } else {
                grouped['Novo'].push(lead);
            }
        });
        setLeads(grouped);
    }, [allLeadsList, stageKeys]);

    const openLeadModal = useCallback((lead) => {
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { 
            ...lead, 
            notes: leadNotes,
            // Prepara o assignedToId para o select no modal (Se for Admin, usa o ownerId)
            assignedToId: lead.ownerId 
        };
        setSelectedLead(leadCopy);
        setModalFormData(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        setModalFormData({});
        fetchLeads(); 
    }, [fetchLeads]);

    const handleModalChange = useCallback((e) => {
        const { name, value } = e.target;
        setModalFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // 💡 FUNÇÃO CRÍTICA: Salva as mudanças do modal (Status e Transferência)
    const saveLeadChanges = useCallback(async () => {
        if (!selectedLead || saving) return;

        setSaving(true);
        
        // 1. Remove campos desnecessários e obtém dados para o payload
        const { assignedToId, ownerId, ownerName, _id, ...rest } = modalFormData;

        // 2. Determina o ID para Reatribuição (Apenas se Admin e o ID for diferente do atual)
        let transferId = undefined;
        if (isAdmin && assignedToId && assignedToId !== selectedLead.ownerId) {
            transferId = assignedToId;
        }

        // 3. Monta o payload final
        const dataToSend = {
            ...rest,
            status: modalFormData.status || selectedLead.status, 
            
            // Sanitização de numéricos (Mantida)
            avgConsumption: modalFormData.avgConsumption === '' || modalFormData.avgConsumption === null ? null : parseFloat(modalFormData.avgConsumption),
            estimatedSavings: modalFormData.estimatedSavings === '' || modalFormData.estimatedSavings === null ? null : parseFloat(modalFormData.estimatedSavings),
            
            // Envia o ID de transferência *somente* se houver reatribuição explícita
            ...(transferId && { assignedToId: transferId }),
            
            // Garantir que as notes sejam um array de string JSON
            notes: Array.isArray(modalFormData.notes) ? modalFormData.notes : selectedLead.notes,
        };
        
        try {
            const response = await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            showToast('Lead atualizado com sucesso.', 'success');
            setAllLeadsList(prevList => prevList.map(l => l._id === selectedLead._id ? response.data : l)); 
            closeLeadModal();

        } catch (error) {
            console.error("Erro ao salvar lead:", error.response?.data || error.message);
            showToast('Erro ao salvar lead.', 'error');
        } finally {
            setSaving(false);
        }
    }, [selectedLead, modalFormData, saving, token, showToast, closeLeadModal, isAdmin]);


    // 💡 FUNÇÃO CRÍTICA CORRIGIDA: Atualiza o status via Drag-and-Drop
    const updateLeadStatus = useCallback(async (lead, newStatus) => {
        if (!lead || !newStatus) return;

        // 1. Remove campos do Lead que não devem ir no payload de atualização
        const { ownerId, ownerName, notes, assignedToId, _id, ...restOfLeadData } = lead;

        // 2. Monta o payload, garantindo a sanitização
        const dataToSend = {
            ...restOfLeadData, 
            status: newStatus,
            
            // Sanitização de numéricos (Mantida)
            avgConsumption: lead.avgConsumption === '' || lead.avgConsumption === null ? null : parseFloat(lead.avgConsumption),
            estimatedSavings: lead.estimatedSavings === '' || lead.estimatedSavings === null ? null : parseFloat(lead.estimatedSavings),
            
            // CRÍTICO: Não enviar assignedToId no Drag&Drop. O Controller usará o owner_id original.
        };
        
        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${lead._id}`, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToast(`Lead ${lead.name} movido para ${newStatus}.`, 'success');
            // Nota: fetchLeads é chamado no onDragEnd para re-agrupar e recarregar
            
        } catch (error) {
            console.error("Erro ao atualizar status:", error.response?.data || error.message);
            showToast('Erro ao mover lead. Ação revertida.', 'error');
            // Se falhar, reverte a UI (A ser implementado no handleDragEnd, mas o fetchLeads resolve)
            fetchLeads(); // Recarrega os leads para refletir o estado correto
        }
    }, [token, showToast, fetchLeads]);


    // Lógica do Drag-and-Drop (Mantida)
    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const startStage = source.droppableId;
        const endStage = destination.droppableId;
        const leadId = draggableId;

        const leadToMove = leads[startStage].find(l => String(l._id) === leadId);
        if (!leadToMove) return;

        // Atualiza a UI imediatamente
        const newLeads = { ...leads };
        newLeads[startStage].splice(source.index, 1);
        newLeads[endStage].splice(destination.index, 0, leadToMove);
        setLeads(newLeads);

        // Chama a API para persistir a mudança (Usando a função corrigida)
        updateLeadStatus(leadToMove, endStage);
    };

    // Lógica de filtro (Mantida)
    const filteredLeadsList = useMemo(() => {
        if (!searchTerm) return allLeadsList;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return allLeadsList.filter(lead => 
            lead.name.toLowerCase().includes(lowerCaseSearch) ||
            lead.phone.includes(searchTerm) ||
            lead.email.toLowerCase().includes(lowerCaseSearch) ||
            lead.uc?.toLowerCase().includes(lowerCaseSearch) || 
            lead.document?.includes(searchTerm)
        );
    }, [allLeadsList, searchTerm]);
    
    // Reagrupa os leads filtrados (Mantida)
    const filteredLeads = useMemo(() => {
        const grouped = stageKeys.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {});
        
        filteredLeadsList.forEach(lead => {
            const status = grouped[lead.status] ? lead.status : 'Novo';
            grouped[status].push(lead);
        });
        return grouped;
    }, [filteredLeadsList, stageKeys]);


    if (isLoading && allLeadsList.length === 0) {
        return <div className="p-6 text-center text-indigo-600">Carregando painel Kanban...</div>;
    }

    if (apiError) {
        return <div className="p-6 text-center text-red-600">{apiError}</div>;
    }

    return (
        <div className="p-6 h-full flex flex-col overflow-hidden">
            
            {/* Cabeçalho e Busca (Mantidos) */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Painel Kanban de Leads
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
                        placeholder="Pesquisar leads no Kanban..." 
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-1 space-x-4 overflow-x-auto pb-4">
                    {stageKeys.map((stage) => (
                        <Droppable key={stage} droppableId={stage}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex-shrink-0 w-80 bg-gray-100 p-4 rounded-xl shadow-inner h-full overflow-y-auto"
                                >
                                    <h2 className={`text-lg font-bold mb-4 p-2 rounded-lg text-center ${STAGES[stage]}`}>{stage} ({filteredLeads[stage]?.length || 0})</h2>
                                    
                                    {filteredLeads[stage]?.map((lead, index) => (
                                        <LeadCard key={lead._id} lead={lead} index={index} openLeadModal={openLeadModal} />
                                    ))}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Modal de Edição (Kanban) - Mantido */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-2xl font-bold text-indigo-600">Editar Lead: {selectedLead.name}</h3>
                            <button onClick={closeLeadModal} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                        </div>

                        {/* Campos de Edição Simples e Status */}
                        <div className="space-y-4">
                            
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select 
                                    name="status"
                                    value={modalFormData.status || selectedLead.status}
                                    onChange={handleModalChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    {Object.keys(STAGES).map(stage => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Reatribuição (Admin Only) */}
                            {isAdmin && users.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reatribuir a</label>
                                    <select
                                        name="assignedToId"
                                        value={modalFormData.assignedToId || selectedLead.ownerId}
                                        onChange={handleModalChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        {/* Opção para o proprietário atual */}
                                        <option value={selectedLead.ownerId}>
                                            {selectedLead.ownerName || 'Proprietário Atual'}
                                        </option>
                                        {/* Outros usuários */}
                                        {users.filter(u => u.id !== selectedLead.ownerId).map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Campos de sanitização (Mantidos) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Consumo Médio (kW/h)</label>
                                <input
                                    type="number"
                                    name="avgConsumption"
                                    value={modalFormData.avgConsumption ?? ''}
                                    onChange={handleModalChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Economia Estimada (R$)</label>
                                <input
                                    type="number"
                                    name="estimatedSavings"
                                    value={modalFormData.estimatedSavings ?? ''}
                                    onChange={handleModalChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Exibir Notas do Lead (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notas Recentes</label>
                                <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto border border-gray-200">
                                    {selectedLead.notes && Array.isArray(selectedLead.notes) ? (
                                        selectedLead.notes
                                            .slice(-3) 
                                            .reverse()
                                            .map((note, idx) => (
                                                <div key={idx} className="mb-2 pb-2 border-b last:border-b-0">
                                                    <p className="text-xs text-indigo-500 font-semibold">{formatNoteDate(note.timestamp)}</p>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p> 
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>
                                    )}
                                </div>
                            </div>
                            
                        </div>

                        {/* Botões do Modal (Mantidos) */}
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={closeLeadModal} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
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
            )}
        </div>
    );
};

export default KanbanBoard;