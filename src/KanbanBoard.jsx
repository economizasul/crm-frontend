// src/KanbanBoard.jsx - CÓDIGO FINAL COM CORREÇÃO DE ERROS DE SAVE, DRAG/DROP E PROTOCOLO WHATSAPP

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaTimes, FaSave, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban e suas cores
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Pimeiro Contato': 'bg-blue-200 text-blue-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
};

// Componente simples de Toast para feedback (inalterado)
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

// Componente Card de Lead (inalterado)
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

// Função auxiliar de formatação de data (inalterada)
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
    
    const [searchTerm, setSearchTerm] = useState(''); 
    const [searchResult, setSearchResult] = useState(null);

    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    // Estado usado para o formulário do modal (usando camelCase para o front)
    const [leadData, setLeadData] = useState({
        name: '', phone: '', document: '', address: '', status: '', origin: '', email: '', 
        uc: '', avgConsumption: '', estimatedSavings: '', qsa: '', notes: [], 
        lat: null, lng: null
    });

    // Função para buscar os leads (inalterada)
    const fetchLeads = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setApiError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(response.data.map(lead => ({
                ...lead,
                notes: lead.notes ? (typeof lead.notes === 'string' ? JSON.parse(lead.notes) : lead.notes) : [],
                // Garante que o frontend tem os campos snake_case para o estado, se precisar
                avgConsumption: lead.avg_consumption,
                estimatedSavings: lead.estimated_savings,
            })));
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
    
    // Lógica de filtragem (inalterada)
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
    
    // Lógica para abrir o modal de edição
    const openLeadModal = useCallback((lead) => {
        setSelectedLead(lead);
        const currentNotes = Array.isArray(lead.notes) ? lead.notes : (lead.notes ? JSON.parse(lead.notes) : []);
        setLeadData({
            name: lead.name || '', 
            phone: lead.phone || '', 
            document: lead.document || '', 
            address: lead.address || '', 
            status: lead.status || 'Novo', 
            origin: lead.origin || '', 
            email: lead.email || '', 
            uc: lead.uc || '', 
            // Mapeia snake_case (DB) para camelCase (State)
            avgConsumption: lead.avg_consumption || '', 
            estimatedSavings: lead.estimated_savings || '', 
            qsa: lead.qsa || '', 
            notes: currentNotes, 
            lat: lead.lat || null, 
            lng: lead.lng || null,
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

    // FUNÇÃO CORRIGIDA: Salva as alterações do lead via modal
    const saveLeadChanges = async () => {
        if (!selectedLead) return;
        setSaving(true);

        try {
            // CORREÇÃO: Cria o objeto dataToSend explicitamente, 
            // mapeando camelCase (frontend) para snake_case (backend/DB)
            const dataToSend = {
                name: leadData.name,
                phone: leadData.phone,
                document: leadData.document,
                address: leadData.address,
                status: leadData.status,
                origin: leadData.origin,
                email: leadData.email,
                uc: leadData.uc,
                qsa: leadData.qsa,
                
                // Conversão de camelCase para snake_case e para float ou null
                avg_consumption: parseFloat(leadData.avgConsumption) || null, 
                estimated_savings: parseFloat(leadData.estimatedSavings) || null,
                
                // Campos de Geo (lat/lng)
                lat: leadData.lat || null, 
                lng: leadData.lng || null,
                
                // Notas (JSON String)
                notes: JSON.stringify(leadData.notes || []), 
                
                // Os seguintes campos são necessários no PUT/UPDATE do backend:
                // owner_id: selectedLead.owner_id, 
                // created_at: selectedLead.created_at,
            };

            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead.id}`, dataToSend, { 
                headers: { Authorization: `Bearer ${token}` }
            });

            setToast({ message: 'Lead atualizado com sucesso!', type: 'success' });
            closeLeadModal();
        } catch (error) {
            console.error("Erro ao salvar lead:", error.response?.data || error);
            setToast({ message: error.response?.data?.error || 'Falha ao salvar lead. Erro interno do servidor.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };
    
    // 🚨 FUNÇÃO CORRIGIDA: Lógica de Drag and Drop
    const handleDrop = async (leadId, newStatus) => {
        const idToFind = typeof leads[0]?.id === 'number' ? parseInt(leadId) : leadId; 
        const leadToUpdate = leads.find(l => l.id === idToFind); 
        
        if (!leadToUpdate || leadToUpdate.status === newStatus) return;

        const oldStatus = leadToUpdate.status;
        setLeads(prevLeads => prevLeads.map(l => 
            l.id === idToFind ? { ...l, status: newStatus } : l 
        ));

        try {
            // Garantir que as notas sejam uma string JSON válida
            const notesToSave = Array.isArray(leadToUpdate.notes) 
                ? JSON.stringify(leadToUpdate.notes) 
                : leadToUpdate.notes || '[]';

            // CORREÇÃO: Cria o objeto dataToSend explicitamente apenas com campos do DB
            // Usamos os valores snake_case que já vieram do DB (leadToUpdate)
            const dataToSend = {
                name: leadToUpdate.name,
                phone: leadToUpdate.phone,
                document: leadToUpdate.document,
                address: leadToUpdate.address,
                status: newStatus, // O campo que mudou
                origin: leadToUpdate.origin,
                email: leadToUpdate.email,
                uc: leadToUpdate.uc,
                qsa: leadToUpdate.qsa,
                
                // Usar valores do leadToUpdate (snake_case) e garantir que são números/null
                avg_consumption: parseFloat(leadToUpdate.avg_consumption) || null,
                estimated_savings: parseFloat(leadToUpdate.estimated_savings) || null,

                lat: leadToUpdate.lat || null, 
                lng: leadToUpdate.lng || null,
                
                notes: notesToSave, 
                owner_id: leadToUpdate.owner_id, // Manter o owner_id
            };
            
            await axios.put(`${API_BASE_URL}/api/v1/leads/${idToFind}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setToast({ message: `Status de ${leadToUpdate.name} atualizado para ${newStatus}!`, type: 'success' });
            
        } catch (error) {
            console.error("Erro ao arrastar e soltar (Drag/Drop):", error);
            
            setLeads(prevLeads => prevLeads.map(l => 
                l.id === idToFind ? { ...l, status: oldStatus } : l 
            ));
            
            setToast({ message: error.response?.data?.error || 'Falha ao mudar status. Recarregando.', type: 'error' });
            fetchLeads(); 
        }
    };
    
    // Função existente: Gerar o link do Google Maps (Ajuste no URL de Maps)
    const getGoogleMapsLink = () => {
        if (!leadData.address) return null;
        const encodedAddress = encodeURIComponent(leadData.address);
        // Protocolo Maps corrigido
        return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    };
    
    // 🚨 FUNÇÃO CORRIGIDA: Gerar o link do WhatsApp
    const getWhatsAppLink = () => {
        if (!leadData.phone) return null;
        // Remove caracteres não-numéricos ((), -, espaço)
        const onlyNumbers = leadData.phone.replace(/[\D]/g, '');
        // Adiciona 55 (código do Brasil) se não começar com ele. 
        const formattedPhone = onlyNumbers.startsWith('55') ? onlyNumbers : `55${onlyNumbers}`;
        
        // Texto pré-preenchido para iniciar a conversa
        const initialMessage = `Olá, ${leadData.name || 'Lead'}, estou entrando em contato a respeito da sua proposta de energia solar.`;
        const encodedMessage = encodeURIComponent(initialMessage);

        // Protocolo WA corrigido
        return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
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
            
            {/* Barra de Pesquisa (inalterada) */}
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
                {/* Feedbacks da Pesquisa (inalterada) */}
                {searchResult === 'not_found' && searchTerm.trim() !== '' && (
                    <span className="text-red-500 font-medium">Lead não encontrado.</span>
                )}
                {searchResult && searchResult !== 'not_found' && (
                    <button onClick={() => setSearchResult(null)} className="text-sm px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition">
                        Limpar Pesquisa <FaTimes className="inline ml-1" />
                    </button>
                )}
            </div>
            
            {/* Container do Kanban */}
            <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]"> 
                {Object.keys(STAGES).map(status => {
                    const statusLeads = (searchResult && searchResult !== 'not_found' && searchResult.status === status) 
                        ? [searchResult] 
                        : (searchResult ? [] : leads.filter(lead => lead.status === status));
                        
                    return (
                        <div 
                            key={status} 
                            className={`flex-shrink-0 w-44 bg-white p-3 rounded-lg shadow-lg ${searchResult && searchResult !== 'not_found' && searchResult.status === status ? 'border-4 border-green-500' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const leadId = e.dataTransfer.getData("leadId");
                                handleDrop(leadId, status);
                            }}
                        >
                            <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status] || 'text-gray-800'}`}>
                                {status} ({statusLeads.length})
                                {searchResult && searchResult !== 'not_found' && searchResult.status === status && (
                                    <span className="text-sm font-normal text-green-500 block"> - Lead Encontrado</span>
                                )}
                            </h2>
                            
                            {statusLeads.map(lead => (
                                <div 
                                    key={lead.id} 
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("leadId", lead.id.toString());
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
                })}
            </div>

            {/* Modal de Edição do Lead */}
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
                                
                                {/* Container para os links (Mapas e WhatsApp) */}
                                <div className="flex flex-wrap gap-3">
                                    {/* Link Google Maps */}
                                    {leadData.address && (
                                        <a 
                                            href={getGoogleMapsLink()} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                                        >
                                            <FaMapMarkerAlt className="mr-2" />
                                            Ver Endereço no Google Maps
                                        </a>
                                    )}
                                    
                                    {/* Link WhatsApp */}
                                    {leadData.phone && (
                                        <a 
                                            href={getWhatsAppLink()} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                        >
                                            <FaWhatsapp className="mr-2" />
                                            Falar no WhatsApp
                                        </a>
                                    )}
                                </div>
                                {/* FIM: Container para os links */}
                                
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
                            
                            {/* Notas e Histórico (inalterado) */}
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

                        {/* Botões do Modal (inalterado) */}
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