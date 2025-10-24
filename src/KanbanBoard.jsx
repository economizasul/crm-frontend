// src/KanbanBoard.jsx - CÓDIGO FINAL E REVISADO (Foco total na correção de Notas)

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaBolt, FaPlus, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
// Importe STAGES do arquivo KanbanBoard ou defina-o aqui se necessário.

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estágios do Kanban (Redefinido ou importado)
export const STAGES = {
    'Novo': 'bg-gray-200 text-gray-800',
    'Para Contatar': 'bg-blue-200 text-blue-800',
    'Em Negociação': 'bg-yellow-200 text-yellow-800',
    'Proposta Enviada': 'bg-purple-200 text-purple-800',
    'Ganho': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-200 text-red-800',
    'Retorno Agendado': 'bg-indigo-200 text-indigo-800',
};

// Componente simples de Toast para feedback (MANTIDO)
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

// Componente Card de Lead (MANTIDO)
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

// Função auxiliar para formatar a data da nota
const formatNoteDate = (timestamp) => {
    if (!timestamp) return 'Sem Data';
    try {
        const date = new Date(timestamp);
        // Formato esperado pelo usuário: 24/10/2025, 11:09
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
    const [newNoteText, setNewNoteText] = useState(''); // Estado para a nova nota
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    // Estado do formulário no Modal, para edição
    const [leadData, setLeadData] = useState({
        name: '', phone: '', document: '', address: '', status: '', origin: '', email: '', 
        uc: '', avgConsumption: '', estimatedSavings: '', qsa: '', notes: [], // CRÍTICO: notes é um array
        lat: null, lng: null
    });

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

    // Função para abrir o Modal e inicializar o estado
    const openLeadModal = useCallback((lead) => {
        setSelectedLead(lead);
        
        // CRÍTICO: O Backend (formatLeadResponse) já deve ter formatado lead.notes como um Array de Objetos.
        const currentNotes = Array.isArray(lead.notes) ? lead.notes : [];

        // Define o estado com os dados do lead
        setLeadData({
            name: lead.name || '',
            phone: lead.phone || '',
            document: lead.document || '',
            address: lead.address || '',
            status: lead.status || 'Novo',
            origin: lead.origin || '',
            email: lead.email || '',
            uc: lead.uc || '',
            avgConsumption: lead.avgConsumption || '',
            estimatedSavings: lead.estimatedSavings || '',
            qsa: lead.qsa || '',
            notes: currentNotes, // Usa o array que veio do backend
            lat: lead.lat || null,
            lng: lead.lng || null,
        });
        
        setNewNoteText('');
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
    }, []);
    
    // Handle change para campos do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({ ...prev, [name]: value }));
    };

    // Função para adicionar uma nova nota
    const addNewNote = () => {
        if (newNoteText.trim() === '') return;

        // CRÍTICO: Cria o objeto da nova nota com timestamp e adiciona ao array
        const newNote = {
            text: newNoteText.trim(),
            timestamp: Date.now(),
            // author: req.user.name // Pode adicionar o nome do usuário logado se tiver como acessar
        };

        setLeadData(prev => ({
            ...prev,
            notes: [...(prev.notes || []), newNote] // Garante que é um array antes de adicionar
        }));
        
        setNewNoteText('');
    };


    // Função para salvar as alterações do Lead
    const saveLeadChanges = async () => {
        if (!selectedLead) return;
        setSaving(true);

        try {
            // CRÍTICO: Antes de enviar ao backend (coluna TEXT), converte o Array de Notas para String JSON
            const dataToSend = {
                ...leadData,
                notes: JSON.stringify(leadData.notes || []), // TRANSFORMA O ARRAY DE OBJETOS EM STRING JSON VÁLIDA
                // Garante que os números são números
                avgConsumption: parseFloat(leadData.avgConsumption) || null,
                estimatedSavings: parseFloat(leadData.estimatedSavings) || null,
            };

            // Remove o _id para não enviar na carga (PUT usa _id do params)
            delete dataToSend._id; 

            const response = await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setToast({ message: 'Lead atualizado com sucesso!', type: 'success' });
            closeLeadModal();
            fetchLeads(); // Recarrega os leads
        } catch (error) {
            console.error("Erro ao salvar lead:", error.response?.data || error);
            setToast({ message: error.response?.data?.error || 'Falha ao salvar lead.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };
    
    // Função para tratar o Drop (Mudança de status via arrastar e soltar)
    const handleDrop = async (leadId, newStatus) => {
        const leadToUpdate = leads.find(l => l._id === leadId);
        if (!leadToUpdate || leadToUpdate.status === newStatus) return;

        // ... (Lógica de handleDrop: Mantida como antes, mas precisa do notes stringificado no envio)
        
        // Atualização otimista (UI)
        setLeads(prevLeads => prevLeads.map(l => 
            l._id === leadId ? { ...l, status: newStatus } : l
        ));

        try {
            // CRÍTICO: Envia o lead completo para a rota PUT. Precisa de notes stringificado.
            const dataToSend = {
                ...leadToUpdate,
                status: newStatus,
                notes: JSON.stringify(leadToUpdate.notes || []), // Manda o notes como string JSON
                // Deve-se converter avgConsumption e estimatedSavings para o backend
                avgConsumption: parseFloat(leadToUpdate.avgConsumption) || null,
                estimatedSavings: parseFloat(leadToUpdate.estimatedSavings) || null,
            };

            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadId}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setToast({ message: `Status de ${leadToUpdate.name} atualizado para ${newStatus}!`, type: 'success' });
        } catch (error) {
            console.error("Erro ao arrastar e soltar:", error);
            // Reverter em caso de falha (Atualização pessimista)
            setLeads(prevLeads => prevLeads.map(l => 
                l._id === leadId ? { ...l, status: leadToUpdate.status } : l
            ));
            setToast({ message: 'Falha ao mudar status. Recarregue.', type: 'error' });
            fetchLeads(); // Força o recarregamento
        }
    };

    // Renderização das colunas do Kanban (MANTIDO)
    const renderColumns = () => {
        // ... (código de renderização de colunas) ...
        const columns = Object.keys(STAGES).map(status => {
            const statusLeads = leads.filter(lead => lead.status === status);
            return (
                <div 
                    key={status} 
                    className="flex-shrink-0 w-80 bg-white p-4 rounded-lg shadow-lg"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const leadId = e.dataTransfer.getData("leadId");
                        handleDrop(parseInt(leadId), status);
                    }}
                >
                    <h2 className={`text-lg font-semibold border-b pb-2 mb-3 ${STAGES[status] || 'text-gray-800'}`}>
                        {status} ({statusLeads.length})
                    </h2>
                    
                    {statusLeads.map(lead => (
                        <div 
                            key={lead._id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("leadId", lead._id.toString())}
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

    // Modal de Edição (KanbanBoard)
    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Kanban de Leads</h1>
            
            <div className="mb-6 flex justify-between items-center">
                {/* ... (Implementação de busca e botão adicionar) ... */}
            </div>

            {/* Container do Kanban: Permite scroll horizontal */}
            <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
                {renderColumns()}
            </div>

            {/* Modal de Edição do Lead */}
            {isModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
                        
                        <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Editar Lead: {selectedLead.name}</h2>
                            <button onClick={closeLeadModal} className="text-gray-500 hover:text-gray-800">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Corpo do Formulário */}
                        <div className="grid grid-cols-2 gap-6">
                            
                            {/* Coluna 1: Dados Principais (MANTIDO) */}
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Informações do Lead</h3>
                                <div className="space-y-4">
                                    <input type="text" name="name" value={leadData.name} onChange={handleChange} placeholder="Nome" className="w-full p-2 border border-gray-300 rounded" required />
                                    <input type="email" name="email" value={leadData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="text" name="phone" value={leadData.phone} onChange={handleChange} placeholder="Telefone" className="w-full p-2 border border-gray-300 rounded" required />
                                    <input type="text" name="document" value={leadData.document} onChange={handleChange} placeholder="CPF/CNPJ" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="text" name="address" value={leadData.address} onChange={handleChange} placeholder="Endereço" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="text" name="origin" value={leadData.origin} onChange={handleChange} placeholder="Origem (Ex: Site, Indicação)" className="w-full p-2 border border-gray-300 rounded" />
                                    
                                    <select name="status" value={leadData.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white" required>
                                        {Object.keys(STAGES).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Coluna 2: Dados Técnicos e Notas */}
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Informações Técnicas</h3>
                                <div className="space-y-4 mb-6">
                                    <input type="text" name="uc" value={leadData.uc} onChange={handleChange} placeholder="Número da UC" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="number" name="avgConsumption" value={leadData.avgConsumption} onChange={handleChange} placeholder="Consumo Médio (kWh)" className="w-full p-2 border border-gray-300 rounded" />
                                    <input type="number" name="estimatedSavings" value={leadData.estimatedSavings} onChange={handleChange} placeholder="Economia Estimada" className="w-full p-2 border border-gray-300 rounded" />
                                    <textarea name="qsa" value={leadData.qsa} onChange={handleChange} placeholder="QSA" className="w-full p-2 border border-gray-300 rounded" rows="2" />
                                </div>

                                {/* Seção de Notas */}
                                <h3 className="text-lg font-semibold text-indigo-600 mb-4">Notas e Histórico</h3>
                                
                                {/* Adicionar Nova Nota */}
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
                                
                                {/* Histórico de Notas (Listando o array leadData.notes) */}
                                <div className="border p-4 rounded-lg bg-gray-50 h-40 overflow-y-auto">
                                    {/* Mapeia o array de objetos. Inverte a ordem para as mais recentes no topo. */}
                                    {leadData.notes && leadData.notes.length > 0 ? (
                                        [...leadData.notes].reverse().map((note, index) => (
                                                <div key={index} className="mb-3 p-2 border-l-4 border-indigo-400 bg-white shadow-sm rounded">
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {/* Garante a formatação correta de data */}
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