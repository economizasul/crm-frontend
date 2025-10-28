// src/KanbanBoard.jsx - CÓDIGO FINAL COM BARRA DE PESQUISA, FILTRO, MODAL E DRAG/DROP

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Pimeiro Contato': 'bg-blue-180 text-blue-800',
    'Retorno Agendado': 'bg-indigo-180 text-indigo-800',
    'Em Negociação': 'bg-yellow-280 text-yellow-800',
    'Proposta Enviada': 'bg-purple-180 text-purple-800',
    'Ganho': 'bg-green-180 text-green-800',
    'Perdido': 'bg-red-180 text-red-800',
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
    return (
        <div 
            onClick={() => onClick(lead)}
            className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition duration-150 ease-in-out"
        >
            <h3 className="font-semibold text-gray-800">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.phone}</p>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STAGES[lead.status] || STAGES.Novo} mt-1 inline-block`}>
                {lead.status}
            </span>
        </div>
    );
};

// Função auxiliar de formatação de data
const formatNoteDate = (timestamp) => {
    if (!timestamp) return 'Sem Data';
    try {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(date);
    } catch (e) {
        return 'Data Inválida';
    }
};


const KanbanBoard = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNoteText, setNewNoteText] = useState(''); 
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    
    // 🚨 NOVO ESTADO: Termo de Pesquisa
    const [searchTerm, setSearchTerm] = useState(''); 
    // 🚨 NOVO ESTADO: Resultado da Pesquisa
    const [searchResult, setSearchResult] = useState(null);

    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    // Estado usado para o formulário do modal
    const [leadData, setLeadData] = useState({
        name: '', phone: '', document: '', address: '', status: '', origin: '', email: '', 
        uc: '', avgConsumption: '', estimatedSavings: '', qsa: '', notes: [], 
        lat: null, lng: null
    });

    // Função para buscar os leads
    const fetchLeads = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setApiError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Erro ao buscar leads:", error);
            if (error.response && error.response.status === 401) {
                logout();
                navigate('/login');
            }
            setApiError('Falha ao carregar leads. Tente novamente.');
            setIsLoading(false);
        }
    }, [token, navigate, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);
    
    // 🚨 Lógica de filtragem
    const handleSearch = (term) => {
        setSearchTerm(term);
        
        if (term.trim() === '') {
            setSearchResult(null);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        
        const foundLead = leads.find(lead => 
            (lead.name && lead.name.toLowerCase().includes(lowerCaseTerm)) ||
            (lead.phone && lead.phone.includes(lowerCaseTerm)) ||
            (lead.document && lead.document.includes(lowerCaseTerm))
        );

        if (foundLead) {
            setSearchResult(foundLead);
        } else {
            setSearchResult('not_found');
        }
    };
    
    // Lógica para abrir o modal de edição (inalterada)
    const openLeadModal = useCallback((lead) => {
        setSelectedLead(lead);
        const currentNotes = Array.isArray(lead.notes) ? lead.notes : [];
        setLeadData({
            name: lead.name || '', phone: lead.phone || '', document: lead.document || '', 
            address: lead.address || '', status: lead.status || 'Novo', origin: lead.origin || '', 
            email: lead.email || '', uc: lead.uc || '', 
            avgConsumption: lead.avgConsumption || '', estimatedSavings: lead.estimatedSavings || '', 
            qsa: lead.qsa || '', notes: currentNotes, lat: lead.lat || null, lng: lead.lng || null,
        });
        setNewNoteText('');
        setIsModalOpen(true);
    }, []);

    // Lógica para fechar o modal (inalterada)
    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        fetchLeads(); 
    }, [fetchLeads]);
    
    // Handler de input do modal (inalterada)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({ ...prev, [name]: value }));
    };

    // Adiciona nota ao estado local do modal (inalterada)
    const addNewNote = () => {
        if (newNoteText.trim() === '') return;

        const newNote = {
            text: newNoteText.trim(),
            timestamp: Date.now(),
        };

        setLeadData(prev => ({
            ...prev,
            notes: [...(prev.notes || []), newNote]
        }));
        
        setNewNoteText('');
    };

    // Salva as alterações do lead via modal (inalterada)
    const saveLeadChanges = async () => {
        if (!selectedLead) return;
        setSaving(true);

        try {
            const dataToSend = {
                ...leadData,
                notes: JSON.stringify(leadData.notes || []), 
                avgConsumption: parseFloat(leadData.avgConsumption) || null,
                estimatedSavings: parseFloat(leadData.estimatedSavings) || null,
            };

            delete dataToSend._id; 

            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setToast({ message: 'Lead atualizado com sucesso!', type: 'success' });
            closeLeadModal();
        } catch (error) {
            console.error("Erro ao salvar lead:", error.response?.data || error);
            setToast({ message: error.response?.data?.error || 'Falha ao salvar lead.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };
    
    // Lógica de Drag and Drop (inalterada)
    const handleDrop = async (leadId, newStatus) => {
        const idToFind = typeof leads[0]?._id === 'number' ? parseInt(leadId) : leadId;
        const leadToUpdate = leads.find(l => l._id === idToFind);
        
        if (!leadToUpdate || leadToUpdate.status === newStatus) return;

        const oldStatus = leadToUpdate.status;
        setLeads(prevLeads => prevLeads.map(l => 
            l._id === idToFind ? { ...l, status: newStatus } : l
        ));

        try {
            const notesToSave = JSON.stringify(leadToUpdate.notes || []); 

            const dataToSend = {
                ...leadToUpdate,
                status: newStatus,
                notes: notesToSave, 
                avgConsumption: parseFloat(leadToUpdate.avgConsumption) || null,
                estimatedSavings: parseFloat(leadToUpdate.estimatedSavings) || null,
            };

            delete dataToSend._id; 
            
            await axios.put(`${API_BASE_URL}/api/v1/leads/${idToFind}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setToast({ message: `Status de ${leadToUpdate.name} atualizado para ${newStatus}!`, type: 'success' });
            
        } catch (error) {
            console.error("Erro ao arrastar e soltar (Drag/Drop):", error);
            
            setLeads(prevLeads => prevLeads.map(l => 
                l._id === idToFind ? { ...l, status: oldStatus } : l
            ));
            
            setToast({ message: 'Falha ao mudar status. Recarregando.', type: 'error' });
            fetchLeads(); 
        }
    };
    
    // Renderiza as colunas do Kanban
    const renderColumns = () => {
        // Se houver resultado de pesquisa, renderiza apenas a coluna do lead encontrado
        if (searchResult && searchResult !== 'not_found') {
            const status = searchResult.status;
            
            return (
                <div 
                    key={status} 
                    className="flex-shrink-0 w-64 bg-white p-4 rounded-lg shadow-lg border-4 border-green-500" // Destaca a coluna
                >
                    <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status] || 'text-gray-800'}`}>
                        {status} (1) 
                        <span className="text-sm font-normal text-green-500 block"> - Lead Encontrado</span>
                    </h2>
                    
                    <div
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("leadId", searchResult._id.toString());
                        }}
                    >
                        <LeadCard lead={searchResult} onClick={openLeadModal} />
                    </div>
                </div>
            );
        }
        
        // Renderização normal do Kanban
        const columns = Object.keys(STAGES).map(status => {
            // Filtra os leads para a coluna atual
            const statusLeads = leads.filter(lead => lead.status === status);
            return (
                <div 
                    key={status} 
                    // Largura otimizada
                    className="flex-shrink-0 w-52 bg-white p-4 rounded-lg shadow-lg"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData("leadId");
                        handleDrop(leadId, status);
                    }}
                >
                    <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status] || 'text-gray-800'}`}>
                        {status} ({statusLeads.length})
                    </h2>
                    
                    {statusLeads.map(lead => (
                        <div 
                            key={lead._id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData("leadId", lead._id.toString());
                            }}
                        >
                            <LeadCard lead={lead} onClick={openLeadModal} />
                        </div>
                    ))}
                    
                    {statusLeads.length === 0 && (
                        <p className="text-gray-500 text-sm italic pt-2">Nenhum lead nesta etapa.</p>
                    )}
                </div>
            );
        });
        return columns;
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-full text-indigo-600 text-lg">Carregando Leads...</div>;
    }

    if (apiError) {
        return <div className="p-8 text-center text-red-600">{apiError}</div>;
    }

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1>
            
            {/* 🚨 NOVA BARRA DE PESQUISA */}
            <div className="mb-6 flex items-center space-x-4">
                <div className="relative flex-1 max-w-lg">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por Nome, Telefone ou Documento..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                </div>
                {/* 🚨 Feedbacks da Pesquisa */}
                {searchResult === 'not_found' && searchTerm.trim() !== '' && (
                    <span className="text-red-500 font-medium">Lead não encontrado.</span>
                )}
                {searchResult && searchResult !== 'not_found' && (
                    <button onClick={() => setSearchResult(null)} className="text-sm px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition">
                        Limpar Pesquisa <FaTimes className="inline ml-1" />
                    </button>
                )}
            </div>
            
            {/* Container do Kanban: Permite scroll horizontal e ajusta a altura com base na tela */}
            {/* Se houver resultado de pesquisa, o Kanban é filtrado */}
            <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]"> 
                {renderColumns()}
            </div>

            {/* Modal de Edição do Lead (inalterado) */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                        
                        <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Editar Lead: {selectedLead.name}</h2>
                            <button onClick={closeLeadModal} className="text-gray-500 hover:text-gray-800">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            
                            {/* Informações do Lead */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Informações do Lead</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="name" value={leadData.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border border-gray-300 rounded" required />
                                    <input type="email" name="email" value={leadData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="text" name="phone" value={leadData.phone} onChange={handleChange} placeholder="Telefone" className="w-full p-2 border border-gray-300 rounded" required />
                                    <input type="text" name="document" value={leadData.document} onChange={handleChange} placeholder="CPF/CNPJ" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="text" name="address" value={leadData.address} onChange={handleChange} placeholder="Endereço" className="col-span-2 p-2 border border-gray-300 rounded" />
                                    
                                    <input type="text" name="origin" value={leadData.origin} onChange={handleChange} placeholder="Origem" className="w-full p-2 border border-gray-300 rounded" />
                                    <select name="status" value={leadData.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white" required>
                                        {Object.keys(STAGES).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Informações Técnicas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Informações Técnicas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="uc" value={leadData.uc} onChange={handleChange} placeholder="Número da UC" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="number" name="avgConsumption" value={leadData.avgConsumption} onChange={handleChange} placeholder="Consumo Médio (kWh)" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="number" name="estimatedSavings" value={leadData.estimatedSavings} onChange={handleChange} placeholder="Economia Estimada" className="w-full p-2 border border-gray-300 rounded" />
                                    <div className="col-span-2">
                                        <textarea name="qsa" value={leadData.qsa} onChange={handleChange} placeholder="QSA" className="w-full p-2 border border-gray-300 rounded" rows="2" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notas e Histórico */}
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Notas e Histórico</h3>
                                
                                <div className="flex space-x-2 mb-4">
                                    <textarea 
                                        value={newNoteText} 
                                        onChange={(e) => setNewNoteText(e.target.value)} 
                                        placeholder="Adicionar nova nota..." 
                                        className="flex-1 p-2 border border-gray-300 rounded resize-none" 
                                        rows="2"
                                    />
                                    <button 
                                        onClick={addNewNote}
                                        className="self-start px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <FaPlus size={16} />
                                    </button>
                                </div>
                                
                                <div className="border p-4 rounded-lg bg-gray-50 h-40 overflow-y-auto">
                                    {leadData.notes && leadData.notes.length > 0 ? (
                                        [...leadData.notes].reverse().map((note, index) => (
                                                <div key={index} className="mb-3 p-2 border-l-4 border-indigo-400 bg-white shadow-sm rounded">
                                                    <p className="text-xs text-gray-500 font-medium">
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