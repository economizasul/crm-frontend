// src/KanbanBoard.jsx - CÓDIGO FINAL E REVISADO

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaBolt, FaPlus, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

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
            className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition duration-150"
            onClick={() => onClick(lead)}
        >
            <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
            <p className="text-xs text-gray-500 mt-1">{lead.phone}</p>
            {lead.avgConsumption && (
                   <p className="text-xs text-indigo-500 mt-1">Consumo: {lead.avgConsumption} kWh</p>
            )}
        </div>
    );
};

// Definição estática das fases do Kanban
const STAGES = [
    { id: 'Para Contatar', title: 'Para Contatar', color: 'bg-blue-500' },
    { id: 'Em Conversação', title: 'Em Conversação', color: 'bg-yellow-500' },
    { id: 'Proposta Enviada', title: 'Proposta Enviada', color: 'bg-green-500' },
    { id: 'Fechado', title: 'Fechado', color: 'bg-gray-500' },
    { id: 'Perdido', title: 'Perdido', color: 'bg-red-500' },
];

const KanbanBoard = () => {
    const [leads, setLeads] = useState({}); 
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [newNoteText, setNewNoteText] = useState(''); 

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 

    // --- LÓGICA DE BUSCA E FETCH ---

    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);
        
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            };
            // Chama a API. A correção de sintaxe do Axios já foi aplicada
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            
            const allLeads = response.data; 

            // Agrupa os leads por status
            const groupedLeads = allLeads.reduce((acc, lead) => {
                const statusKey = STAGES.find(s => s.id === lead.status) ? lead.status : 'Para Contatar'; 
                if (!acc[statusKey]) {
                    acc[statusKey] = [];
                }
                acc[statusKey].push(lead);
                return acc;
            }, {});

            setLeads(groupedLeads);

        } catch (error) {
            console.error('Erro ao buscar leads:', error.response?.data || error.message);
            // Se o erro for 401 (Não Autorizado), força o logout.
            if (error.response?.status === 401) {
                logout(); 
                setApiError('Sessão expirada. Faça login novamente.');
            } else {
                setApiError('Falha ao carregar leads. Verifique a conexão com a API.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);
    
    // --- LÓGICA DE MODAL E EDIÇÃO ---
    
    const openLeadModal = (lead) => {
        // Asseguramos que 'notes' seja um array de objetos {text: string, timestamp: number}.
        const leadNotes = Array.isArray(lead.notes) 
            ? lead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
            : [];
            
        const leadCopy = { ...lead, notes: leadNotes };
        
        setSelectedLead(leadCopy);
        setNewNoteText(''); 
        setIsModalOpen(true);
    };

    const closeLeadModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
        setNewNoteText('');
        setSaving(false); 
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedLead((prev) => ({ ...prev, [name]: value }));
    };
    
    // Função para formatar a data da nota
    const formatNoteDate = (timestamp) => {
        if (timestamp === 0) return 'Data Desconhecida (Nota Antiga)';
        if (!timestamp) return 'Sem Data';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Data Inválida';
            
            // Usando aspas simples para garantir que a string do Intl.DateTimeFormat não quebre o JSX
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false,
            }).format(date);
        } catch (e) {
            return 'Erro de Formato';
        }
    };

    // FUNÇÃO DE SALVAMENTO
    const saveLeadChanges = async () => {
        if (!selectedLead || saving) return;

        setSaving(true);
        setApiError(null);

        // 1. Prepara as notas: Adiciona a nova nota ao array LOCAL
        let internalNotes = selectedLead.notes ? [...selectedLead.notes] : [];
        if (newNoteText.trim()) {
             internalNotes.push({ text: newNoteText.trim(), timestamp: Date.now() }); 
        }
        
        // 2. Prepara os dados para a requisição PUT
        const dataToSend = {
            status: selectedLead.status, 
            name: selectedLead.name,
            phone: selectedLead.phone,
            document: selectedLead.document,
            address: selectedLead.address,
            origin: selectedLead.origin,
            email: selectedLead.email,
            // Certifique-se de que os valores numéricos são tratados corretamente
            avgConsumption: selectedLead.avgConsumption ? parseFloat(selectedLead.avgConsumption) : null,
            estimatedSavings: selectedLead.estimatedSavings ? parseFloat(selectedLead.estimatedSavings) : null,
            
            // Mapeia o array de objetos para um array de STRINGS (texto puro)
            notes: internalNotes.map(n => n.text).filter(Boolean), 
            
            uc: selectedLead.uc,
            qsa: selectedLead.qsa || null,
        };

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, dataToSend, config);

            setToastMessage({ message: 'Lead salvo e fase atualizada com sucesso!', type: 'success' });
            
            await fetchLeads(); 
            
            closeLeadModal(); 

        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            setApiError('Falha ao salvar lead. Tente novamente.');
            setToastMessage({ message: `Falha ao salvar lead: ${error.response?.data?.error || error.message || 'Erro desconhecido'}`, type: 'error' });
        } finally {
            setSaving(false); 
        }
    };
    
    // --- LÓGICA DE RENDERIZAÇÃO ---
    
    const filteredLeads = (stageId) => {
        const stageLeads = leads[stageId] || [];
        if (!searchTerm.trim()) {
            return stageLeads;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return stageLeads.filter(lead => {
            const matchName = lead.name?.toLowerCase().includes(lowerCaseSearch);
            const matchPhone = lead.phone?.includes(searchTerm);
            const matchDocument = lead.document?.includes(searchTerm);
            const matchUC = lead.uc?.includes(searchTerm);
            const matchAddress = lead.address?.toLowerCase().includes(lowerCaseSearch);
            const matchOrigin = lead.origin?.toLowerCase().includes(lowerCaseSearch);
            return matchName || matchPhone || matchDocument || matchUC || matchAddress || matchOrigin;
        });
    };
    
    const renderColumnContent = (stageId) => {
        if (apiError && !isLoading) {
            // Linha 268 (Aproximadamente): Correção da aspa dentro do template literal
            return <p className="text-red-500 text-sm text-center">Erro: {apiError}</p>;
        }
        if (isLoading) {
            return (
                <div className="animate-pulse space-y-3">
                    <div className="h-10 bg-gray-300 rounded"></div>
                    <div className="h-10 w-3/4 bg-gray-300 rounded"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                </div>
            );
        }

        const currentLeads = filteredLeads(stageId);
        if (currentLeads.length === 0) {
            return <p className="text-gray-500 text-sm text-center py-4">Sem leads nesta fase ou filtro.</p>;
        }

        return (
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1"> 
                {currentLeads.map(lead => (
                    <LeadCard key={lead._id} lead={lead} onClick={openLeadModal} />
                ))}
            </div>
        );
    };

    return (
        <div className="p-6">
            {/* ... (Seção de Título e Botões) */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">Kanban de Leads</h1>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar Leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button 
                    onClick={() => navigate('/leads/cadastro')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                    <FaPlus size={14} />
                    <span>Novo Lead</span>
                </button>
            </div>

            {/* CONTAINER PRINCIPAL DAS COLUNAS */}
            <div className="flex space-x-6 overflow-x-auto pb-4 items-start"> 
                {STAGES.map(stage => (
                    <div 
                        key={stage.id} 
                        className="flex-shrink-0 w-80 p-4 bg-gray-100 border border-gray-300 rounded-xl shadow-xl"
                    >
                        <div className={`text-lg font-bold mb-3 p-2 rounded-lg text-white text-center ${stage.color}`}>
                            {stage.title} ({leads[stage.id]?.length || 0})
                        </div>
                        
                        {renderColumnContent(stage.id)} 
                        
                        <button 
                            onClick={() => navigate('/leads/cadastro')}
                            className="w-full mt-3 py-2 px-4 border border-indigo-400 text-indigo-600 rounded-lg hover:bg-indigo-100 transition duration-150 flex items-center justify-center space-x-2"
                        >
                            <FaPlus size={14} />
                            <span>Adicionar Lead</span>
                        </button>
                    </div>
                ))}
            </div>
            
            {/* TOAST DE FEEDBACK */}
            {toastMessage && (
                <Toast 
                    message={toastMessage.message} 
                    type={toastMessage.type} 
                    onClose={() => setToastMessage(null)} 
                />
            )}

            {/* MODAL DE EDIÇÃO DE LEAD */}
            {isModalOpen && selectedLead && (
                // Linha 326 (Aproximadamente): Correção na linha de abertura da div do modal
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        {/* ... (Cabeçalho do Modal) */}
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-bold text-indigo-800">Editar Lead: {selectedLead.name}</h2>
                            <button onClick={closeLeadModal} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* ... (Campos Nome, Telefone, Documento, etc.) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" name="name" className="w-full border rounded px-3 py-2" value={selectedLead.name || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="text" name="phone" className="w-full border rounded px-3 py-2" value={selectedLead.phone || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label><input type="text" name="document" className="w-full border rounded px-3 py-2" value={selectedLead.document || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">UC</label><input type="text" name="uc" className="w-full border rounded px-3 py-2" value={selectedLead.uc || ''} onChange={handleInputChange} /></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input type="text" name="address" className="w-full border rounded px-3 py-2" value={selectedLead.address || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Origem</label><input type="text" name="origin" className="w-full border rounded px-3 py-2" value={selectedLead.origin || ''} onChange={handleInputChange} /></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Consumo Médio (kWh)</label>
                                    <input type="number" name="avgConsumption" className="w-full border rounded px-3 py-2" value={selectedLead.avgConsumption || ''} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status (Fase do Kanban)</label>
                                    <select name="status" className="w-full border rounded px-3 py-2" value={selectedLead.status || 'Para Contatar'} onChange={handleInputChange}>
                                        {STAGES.map(stage => (<option key={stage.id} value={stage.id}>{stage.title}</option>))}
                                    </select>
                                </div>
                            </div>

                            {/* CAMPO DE NOVA NOTA */}
                            <div className="border p-4 rounded-lg bg-gray-50">
                                <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center space-x-2">
                                    <FaPaperclip size={16} />
                                    <span>Adicionar Nova Nota</span>
                                </label>
                                <textarea
                                    rows={2}
                                    name="newNoteText"
                                    className="w-full border rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Digite a nova nota aqui..."
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                />
                            </div>

                            {/* HISTÓRICO DE NOTAS */}
                            <div>
                                <h3 className="text-md font-bold text-gray-800 mb-2">Histórico de Notas ({selectedLead.notes?.length || 0})</h3>
                                <div className="max-h-40 overflow-y-auto border p-3 rounded-lg bg-white shadow-inner">
                                    {selectedLead.notes && selectedLead.notes.length > 0 ? (
                                        // Linha 394-396 (Aproximadamente): Fluxo revisado do map
                                        [...selectedLead.notes]
                                            .concat(newNoteText.trim() ? [{ text: newNoteText.trim(), timestamp: Date.now() + 1 }] : [])
                                            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                                            .map((note, index) => (
                                                <div key={index} className="mb-2 p-2 border-b last:border-b-0 text-sm">
                                                    <p className={`font-semibold text-xs ${note.timestamp > Date.now() ? 'text-red-500' : 'text-indigo-600'}`}>
                                                        {note.timestamp > Date.now() ? 'Nova (Não Salva)' : formatNoteDate(note.timestamp)}
                                                    </p>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p> 
                                                </div>
                                            ))
                                    ) : (
                                        // Linha 401 (Aproximadamente): Corrigido para fechar o ternário e o bloco JSX
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