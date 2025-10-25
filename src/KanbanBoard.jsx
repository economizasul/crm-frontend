// src/KanbanBoard.jsx - CÓDIGO FINAL COM CORES DE BOTÃO AJUSTADAS PARA O TEMA VERDE

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores (Mantidas para diferenciação visual)
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

// Componente Card de Lead (Mantido)
const LeadCard = React.memo(({ lead, onClick, isDragging }) => {
    // ... (código LeadCard mantido)
    const statusClasses = STAGES[lead.status] || STAGES['Novo'];

    return (
        <div 
            draggable 
            onDragStart={(e) => {
                e.dataTransfer.setData('leadId', lead._id);
            }}
            onClick={() => onClick(lead)}
            className={`bg-white p-3 border border-gray-200 rounded-lg shadow-md cursor-pointer mb-2 transition transform hover:shadow-lg ${isDragging ? 'opacity-50 border-dashed border-2 border-gray-400' : ''}`}
        >
            <h3 className="text-sm font-semibold text-gray-800 truncate" title={lead.name}>{lead.name}</h3>
            <p className="text-xs text-gray-500 truncate" title={`UC: ${lead.uc}`}>UC: {lead.uc}</p>
            <div className="flex justify-between items-center mt-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusClasses}`}>
                    {lead.status}
                </span>
                {lead.avgConsumption > 0 && (
                    <span className="text-xs font-bold text-blue-600">
                        {lead.avgConsumption} kWh
                    </span>
                )}
            </div>
        </div>
    );
});


// Componente Coluna do Kanban (Mantido)
const KanbanColumn = ({ status, leads, onDropLead, openLeadModal }) => {
    // ... (código KanbanColumn mantido)
    const titleClass = STAGES[status];

    const handleDrop = (e) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        onDropLead(leadId, status);
    };

    return (
        <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}
            className="w-full sm:w-64 md:w-56 lg:w-64 flex-shrink-0 mx-2 p-3 bg-gray-50 rounded-lg shadow-inner overflow-y-auto max-h-full"
        >
            <h2 className={`text-center text-sm font-bold p-2 mb-3 rounded shadow-md ${titleClass}`}>
                {status} ({leads.length})
            </h2>
            <div className="space-y-2">
                {leads.map((lead) => (
                    <LeadCard key={lead._id} lead={lead} onClick={openLeadModal} />
                ))}
            </div>
            {leads.length === 0 && (
                <p className="text-center text-gray-400 text-sm italic py-4">Arraste leads para cá</p>
            )}
        </div>
    );
};

// Componente Principal
const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    // Estado do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Função de formatação de data (mantida)
    const formatNoteDate = useCallback((timestamp) => {
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
    }, []);

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

    // Lógica Drag/Drop (mantida)
    const handleDropLead = useCallback(async (leadId, newStatus) => {
        const leadToUpdate = leads.find(l => l._id === leadId);
        if (!leadToUpdate || leadToUpdate.status === newStatus) return;

        setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
        
        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setToast({ message: `Status do Lead '${leadToUpdate.name}' alterado para '${newStatus}'.`, type: 'success' });
        } catch (error) {
            // Reverter em caso de erro
            setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: leadToUpdate.status } : l));
            setToast({ message: 'Falha ao atualizar status do Lead.', type: 'error' });
            console.error('Erro ao atualizar status:', error);
        }

    }, [leads, token]);
    
    // Lógica do Modal (mantida)
    const openLeadModal = useCallback((lead) => {
        const leadNotes = Array.isArray(lead.notes) ? lead.notes : [];
        const leadCopy = { ...lead, notes: leadNotes };

        setSelectedLead(leadCopy);
        setFormData(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const saveLeadChanges = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToast({ message: `Lead '${selectedLead.name}' atualizado com sucesso.`, type: 'success' });
            closeLeadModal();
            fetchLeads(); // Recarregar a lista após salvar
        } catch (error) {
            setToast({ message: 'Falha ao salvar alterações do Lead.', type: 'error' });
            console.error('Erro ao salvar lead:', error);
        } finally {
            setSaving(false);
        }
    };
    
    // Filtrar e agrupar leads (mantida)
    const groupedLeads = useMemo(() => {
        return Object.keys(STAGES).reduce((acc, status) => {
            acc[status] = leads.filter(lead => lead.status === status);
            return acc;
        }, {});
    }, [leads]);
    
    return (
        <div className="flex-1 p-4 overflow-hidden h-full">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Kanban Board</h1>
            
            {isLoading && <div className="text-center text-lg">Carregando Leads...</div>}
            {apiError && <div className="text-center text-red-600">{apiError}</div>}

            <div className="flex overflow-x-auto space-x-4 pb-4 h-[calc(100vh-140px)]">
                {Object.keys(groupedLeads).map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        leads={groupedLeads[status]}
                        onDropLead={handleDropLead}
                        openLeadModal={openLeadModal}
                    />
                ))}
            </div>

            {/* Modal de Edição (Estilo Tailwind) */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Editar Lead: {selectedLead.name}</h2>
                            <button onClick={closeLeadModal} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                        </div>
                        
                        {/* Conteúdo do Formulário */}
                        <div className="space-y-4">
                            
                            <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"> {/* AJUSTE DE FOCO: green-500 */}
                                {Object.keys(STAGES).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <input name="name" type="text" value={formData.name || ''} onChange={handleChange} placeholder="Nome" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500" /> {/* AJUSTE DE FOCO: green-500 */}
                            <input name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500" /> {/* AJUSTE DE FOCO: green-500 */}
                            <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} placeholder="Telefone" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500" /> {/* AJUSTE DE FOCO: green-500 */}
                            <input name="uc" type="text" value={formData.uc || ''} onChange={handleChange} placeholder="UC" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500" /> {/* AJUSTE DE FOCO: green-500 */}
                            <input name="avgConsumption" type="number" value={formData.avgConsumption || ''} onChange={handleChange} placeholder="Consumo Médio (kWh)" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500" /> {/* AJUSTE DE FOCO: green-500 */}
                            <textarea name="notes" value={formData.notes?.map(n => n.text).join('\n') || ''} onChange={handleChange} placeholder="Notas (uma por linha)" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 min-h-[100px]"></textarea> {/* AJUSTE DE FOCO: green-500 */}
                            
                            {/* Histórico de Notas (Read-only) */}
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                                <h3 className="font-semibold mb-2 text-gray-700">Histórico de Notas</h3>
                                <div className="space-y-3">
                                    {selectedLead.notes && Array.isArray(selectedLead.notes) && selectedLead.notes.length > 0 ? (
                                        selectedLead.notes
                                            .slice().reverse().map((note, index) => (
                                                <div key={index} className="border-l-4 border-gray-300 pl-3">
                                                    <p className="font-semibold text-xs text-gray-500">
                                                        {formatNoteDate(note.timestamp)}
                                                    </p>
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
                                // AJUSTE DE COR: indigo-600 -> green-600 / hover:bg-indigo-700 -> hover:bg-green-700
                                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 flex items-center space-x-2"
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