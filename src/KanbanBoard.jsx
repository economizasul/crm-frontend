// src/KanbanBoard.jsx - CÓDIGO FINAL COM BARRA DE PESQUISA, FILTRO, MODAL E DRAG/DROP

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
// 🚨 CORREÇÃO CRÍTICA: Importação do fork compatível e ativo para Drag and Drop
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
        }, 3000); // Fecha automaticamente após 3 segundos
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
// Card de Lead
// =============================
const LeadCard = React.memo(({ lead, index, openLeadModal }) => {
    const statusClass = STAGES[lead.status] || 'bg-gray-100 text-gray-700';

    return (
        // O componente Draggable vem do @hello-pangea/dnd (antigo react-beautiful-dnd)
        <Draggable draggableId={lead.id.toString()} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => openLeadModal(lead)}
                    className="p-3 mb-3 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                >
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {lead.name}
                    </div>
                    <p className="text-xs text-gray-500">{lead.phone}</p>
                    <div className={`mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusClass}`}>
                        {lead.status}
                    </div>
                </div>
            )}
        </Draggable>
    );
});
LeadCard.displayName = 'LeadCard';

// ================================
// Coluna Kanban (Droppable)
// ================================
const KanbanColumn = React.memo(({ stageName, leads, openLeadModal }) => {
    const statusClass = STAGES[stageName] || 'bg-gray-100 text-gray-700';

    return (
        // O componente Droppable vem do @hello-pangea/dnd (antigo react-beautiful-dnd)
        <Droppable droppableId={stageName}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 min-w-[300px] max-w-[400px] bg-gray-50 border border-gray-200 rounded-xl flex flex-col mx-2 p-3 shadow-inner"
                >
                    {/* Título da Coluna */}
                    <div className={`sticky top-0 p-2 mb-3 rounded-lg text-center font-bold text-sm ${statusClass} shadow-md`}>
                        {stageName} ({leads.length})
                    </div>
                    
                    {/* Lista de Cards */}
                    <div className="flex-grow overflow-y-auto">
                        {leads.map((lead, index) => (
                            <LeadCard 
                                key={lead.id} 
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
    // Inicializa o estado do formulário com base no lead selecionado
    // Nota: O modal não permite mudar o status. Isso é feito apenas pelo Drag/Drop.
    const [formData, setFormData] = useState({});
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [noteError, setNoteError] = useState('');
    const [toast, setToast] = useState(null);

    // Efeito para carregar o lead selecionado e garantir que notes seja um array
    useEffect(() => {
        if (selectedLead) {
            // Assegura que notes é um array (evita erros se o campo DB for nulo/string não JSON)
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

    // Função auxiliar para formatar a data da nota
    const formatNoteDate = (timestamp) => {
        if (timestamp === 0 || !timestamp) return 'Sem Data';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Data Inválida';
            
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false,
            }).format(date);
        } catch {
            return 'Data Inválida';
        }
    };

    // Handler para mudança nos campos do formulário (exceto notas)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler para adicionar nova nota
    const handleAddNote = () => {
        if (newNote.trim().length < 5) {
            setNoteError('A nota deve ter pelo menos 5 caracteres.');
            return;
        }
        setNoteError('');
        
        const noteToAdd = {
            text: newNote.trim(),
            timestamp: new Date().getTime(),
            user: formData.owner_name || 'Usuário Atual' // Usa o nome do owner ou um placeholder
        };

        setFormData(prev => ({
            ...prev,
            notes: [...prev.notes, noteToAdd]
        }));
        setNewNote('');
    };

    // Handler para salvar as alterações do lead
    const saveLeadChanges = async () => {
        setSaving(true);
        setToast(null);

        // 1. Prepara o objeto de dados para envio
        const dataToSave = {
            ...formData,
            // CRÍTICO: Converte o array de notes de volta para string JSON para salvar no banco
            notes: JSON.stringify(formData.notes),
            // Remove campos que não devem ser enviados (id, owner_name, created_at, etc.)
            id: undefined, 
            owner_name: undefined,
            created_at: undefined,
            updated_at: undefined,
        };

        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${formData.id}`, dataToSave, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setToast({ message: 'Lead salvo com sucesso!', type: 'success' });
            // Recarrega os leads no Kanban e fecha o modal
            fetchLeads();
            onClose();

        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            setToast({ message: 'Falha ao salvar o lead. Tente novamente.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Se o modal não deve estar aberto, retorna null ou nada
    if (!isModalOpen || !selectedLead) return null;

    // Renderização do Modal
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-40 p-4 transition-opacity duration-300">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Cabeçalho do Modal */}
                <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-indigo-700">{selectedLead.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Corpo do Modal (Conteúdo rolável) */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Coluna de Detalhes do Lead (Esquerda) */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Detalhes Principais</h3>
                            
                            {/* Status atual (apenas para visualização no modal) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Atual</label>
                                <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${STAGES[selectedLead.status]}`}>{selectedLead.status}</span>
                            </div>

                            {/* Campos Editáveis */}
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

                            {/* Campos Numéricos (uc, avg_consumption, estimated_savings) */}
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

                            {/* Campo QSA */}
                            <div>
                                <label htmlFor="qsa" className="block text-sm font-medium text-gray-700">QSA (Quadro de Sócios e Administradores)</label>
                                <textarea
                                    name="qsa"
                                    rows="3"
                                    value={formData.qsa || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                                ></textarea>
                            </div>
                        </div>

                        {/* Coluna de Notas e Log (Direita) */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Notas do Lead</h3>
                            
                            {/* Área para Adicionar Nova Nota */}
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

                            {/* Histórico de Notas (Rolável) */}
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
                            
                        </div>

                        {/* Botões do Modal */}
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

    // ===================================
    // 1. Fetch Leads (Buscar Leads)
    // ===================================
    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Garante que leads com notas nulas ou em string não-JSON sejam formatados corretamente
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
                    notes: notesArray,
                    // Adiciona o nome do owner para exibição
                    owner_name: lead.owner_name || 'Desconhecido'
                };
            });

            setLeads(formattedLeads);
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            setApiError('Falha ao carregar leads. Tente novamente mais tarde.');
            setLeads([]); // Limpar leads em caso de erro
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Chama a função de busca na montagem
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // ===================================
    // 2. Manipulação de Drag and Drop
    // ===================================

    // Função que é chamada ao soltar um Draggable
    const onDragEnd = useCallback(async (result) => {
        const { source, destination, draggableId } = result;

        // Caso 1: Soltou fora de qualquer Droppable
        if (!destination) {
            return;
        }

        // Caso 2: Soltou na mesma coluna (sem mudança de status)
        if (source.droppableId === destination.droppableId) {
            // Se for necessário reordenar dentro da coluna, o código iria aqui.
            // Para o CRM, não estamos implementando reordenação.
            return;
        }

        // Caso 3: Mudança de Coluna (Mudança de Status)
        const leadId = parseInt(draggableId);
        const newStatus = destination.droppableId;
        
        // 1. Otimisticamente (atualiza o estado local primeiro para resposta rápida)
        const updatedLeads = leads.map(lead => 
            lead.id === leadId ? { ...lead, status: newStatus } : lead
        );
        setLeads(updatedLeads);

        // 2. Persiste a mudança na API
        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Opcional: Mostrar Toast de sucesso
            setToast({ message: `Lead ${leadId} movido para ${newStatus}!`, type: 'success' });

        } catch (error) {
            console.error('Erro ao atualizar status do lead:', error);
            // Reverte a mudança se a API falhar (pessimista)
            setLeads(leads); 
            setToast({ message: 'Falha ao mover lead. Tente novamente.', type: 'error' });
        }
    }, [leads, token]); // Depende de leads para mapeamento e token para API

    // ===================================
    // 3. Filtragem e Agrupamento
    // ===================================

    // Leads filtrados e agrupados, recalculados apenas quando leads, searchTerm ou filterByStage mudam
    const groupedLeads = useMemo(() => {
        const filtered = leads.filter(lead => {
            // Filtro por termo de pesquisa (nome, email, telefone, uc, etc.)
            const matchesSearch = searchTerm.trim() === '' || 
                                Object.values(lead).some(value => 
                                    String(value).toLowerCase().includes(searchTerm.toLowerCase().trim())
                                );

            // Filtro por estágio do Kanban
            const matchesStage = filterByStage === 'Todos' || lead.status === filterByStage;
            
            // Filtro por owner (usuário logado) se o usuário não for Admin
            const matchesOwner = user?.role === 'Admin' || lead.owner_id === user?.id;

            return matchesSearch && matchesStage && matchesOwner;
        });

        // Agrupa os leads filtrados pelas chaves de estágio definidas
        return Object.keys(STAGES).reduce((acc, stage) => {
            acc[stage] = filtered.filter(lead => lead.status === stage);
            return acc;
        }, {});
    }, [leads, searchTerm, filterByStage, user]);

    // ===================================
    // 4. Manipulação do Modal
    // ===================================

    const openLeadModal = useCallback((lead) => {
        // Garantir que as notas estejam em formato de array para o modal
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { ...lead, notes: leadNotes };

        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        // Não precisa recarregar aqui, pois a função saveLeadChanges faz isso
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleFilterChange = useCallback((e) => {
        setFilterByStage(e.target.value);
    }, []);


    // ===================================
    // 5. Renderização
    // ===================================

    if (isLoading) {
        return <div className="p-8 text-center text-lg text-indigo-600">Carregando dados do Kanban...</div>;
    }

    if (apiError) {
        return <div className="p-8 text-center text-red-600 font-bold">{apiError}</div>;
    }

    return (
        <div className="flex-1 flex flex-col p-6 bg-gray-50 h-full overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Header/Controles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-xl shadow-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
                    Kanban CRM
                </h1>
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                    {/* Botão Adicionar Lead */}
                    <button
                        onClick={() => navigate('/register-lead')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200 w-full md:w-auto"
                    >
                        <FaPlus />
                        <span>Novo Lead</span>
                    </button>

                    {/* Filtro por Estágio */}
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

                    {/* Barra de Pesquisa */}
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

            {/* Kanban Board (DragDropContext) */}
            {/* O componente DragDropContext vem do @hello-pangea/dnd (antigo react-beautiful-dnd) */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-grow flex overflow-x-auto overflow-y-hidden pb-4 space-x-4">
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
            
            {/* Modal de Edição/Visualização do Lead */}
            <LeadEditModal 
                selectedLead={selectedLead}
                isModalOpen={isModalOpen}
                onClose={closeLeadModal}
                token={token}
                fetchLeads={fetchLeads}
                stages={STAGES} // Passa as fases para o modal
            />
        </div>
    );
};

export default KanbanBoard;