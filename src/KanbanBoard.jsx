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

// Componente Card de Lead (Versão simplificada)
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
    // Estado do Kanban e Leads
    const [leads, setLeads] = useState({}); 
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    // Estados para o Modal de Edição
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    // NOVO: Estado para a nova nota a ser adicionada
    const [newNoteText, setNewNoteText] = useState(''); 

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 

    // --- LÓGICA DE BUSCA E FETCH ---

    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setApiError('Sessão expirada. Redirecionando para login.');
            setIsLoading(false);
            logout();
            navigate('/login', { replace: true });
            return;
        }

        setIsLoading(true);
        setApiError(null);
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const allLeads = response.data;

            // Agrupa os leads por status
            const groupedLeads = allLeads.reduce((acc, lead) => {
                // Garante que o status seja válido (usa 'Para Contatar' se for nulo ou inválido)
                const statusKey = lead.status && STAGES.some(s => s.id === lead.status) ? lead.status : 'Para Contatar'; 
                if (!acc[statusKey]) {
                    acc[statusKey] = [];
                }
                // Garante que 'notes' seja um array
                acc[statusKey].push({ 
                    ...lead, 
                    notes: Array.isArray(lead.notes) ? lead.notes : [] 
                });
                return acc;
            }, {});

            setLeads(groupedLeads);

        } catch (error) {
            console.error('Erro ao buscar leads:', error.response?.data || error.message);
            setApiError('Falha ao carregar leads. Verifique a conexão com a API.');
            if (error.response?.status === 401) {
                logout();
                navigate('/login', { replace: true });
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, navigate, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);
    
    // --- LÓGICA DE MODAL E EDIÇÃO ---
    
    const openLeadModal = (lead) => {
        setSelectedLead({ ...lead });
        setNewNoteText(''); // Limpa o campo de nova nota
        setIsModalOpen(true);
    };

    const closeLeadModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
        setNewNoteText('');
        setSaving(false); // Garante que o estado de saving seja resetado
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedLead((prev) => ({ ...prev, [name]: value }));
    };
    
    // Função para formatar a data da nota
    const formatNoteDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            // Tenta usar o timestamp se for um número, ou tenta parsear se for string
            const date = new Date(timestamp);
            if (isNaN(date)) return '';
            
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).format(date);
        } catch (e) {
            return '';
        }
    };

    const saveLeadChanges = async () => {
        if (!selectedLead || saving) return;

        setSaving(true);
        setApiError(null);

        // 1. Prepara as notas para envio (Adiciona a nova nota à lista)
        let updatedNotes = selectedLead.notes ? [...selectedLead.notes] : [];
        if (newNoteText.trim()) {
             // Formato da nota: { text: "...", timestamp: 1678886400000 }
             // Se o seu backend espera apenas strings, ajuste aqui:
             // updatedNotes.push(newNoteText.trim());
             
             // Assumindo que o backend aceita ou apenas a string, ou um array de strings/objetos:
             // Vamos enviar o texto puro e o backend deverá lidar com a formatação.
             updatedNotes.push({ text: newNoteText.trim(), timestamp: Date.now() }); 
        }
        
        // 2. Prepara os dados:
        const updatedData = {
            ...selectedLead,
            notes: updatedNotes.map(n => n.text || n), // Garante que apenas o texto vá para o backend
            // Se o seu backend espera o objeto completo (com timestamp), ajuste a linha acima.
        };
        
        // Remove campos de front-end ou que não devem ir no PUT
        delete updatedData.notesText; 
        delete updatedData._id; 
        delete updatedData.created_at; 
        delete updatedData.updated_at; 
        delete updatedData.userId; 

        try {
            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, updatedData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            // Sucesso
            setToastMessage({ message: 'Lead salvo com sucesso!', type: 'success' });
            
            // 3. Recarrega os leads DEPOIS DE SALVAR
            await fetchLeads(); 
            
            // 4. Fecha o modal (só depois que a recarga estiver concluída)
            closeLeadModal(); 

        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            setApiError('Falha ao salvar lead. Tente novamente.');
            setToastMessage({ message: 'Falha ao salvar lead.', type: 'error' });
        } finally {
            setSaving(false); // CRÍTICO: Garante que o estado 'saving' seja resetado
        }
    };
    
    // --- LÓGICA DE FILTRAGEM ---

    // Filtra leads dentro de uma coluna (busca por vários campos)
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

    // Renderiza o conteúdo da coluna
    const renderColumnContent = (stageId) => {
        if (apiError && !isLoading) {
            // Este é o erro visível após o crash (image_1a73f9.png)
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
            <h1 className="text-4xl font-extrabold text-indigo-800 mb-6">Kanban de Leads</h1>

            {/* BARRA DE PESQUISA E BOTÕES */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                <div className="flex items-center w-full md:w-1/2 lg:w-1/3 bg-white p-2 rounded-xl shadow-md border border-gray-200">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Buscar (Nome, Telefone, CPF/CNPJ, UC, Endereço...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                </div>
                
                <div className="flex space-x-3 w-full md:w-auto">
                    {/* Botão Novo Lead */}
                    <button 
                        onClick={() => navigate('/leads/cadastro')}
                        className="w-full md:w-auto flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200"
                    >
                        <FaPlus size={16} />
                        <span>Novo Lead</span>
                    </button>
                    {/* Botão Atualizar Leads (Este botão resolve seu problema temporariamente) */}
                    <button 
                        onClick={fetchLeads}
                        disabled={isLoading}
                        className="w-full md:w-auto flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-md hover:bg-gray-300 transition duration-200 disabled:opacity-50"
                        title="Atualizar Leads"
                    >
                        <FaBolt size={16} className={isLoading ? 'animate-spin' : ''} />
                        <span>Atualizar</span>
                    </button>
                </div>
            </div>

            {/* CONTAINER PRINCIPAL DAS COLUNAS com rolagem horizontal */}
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
                        
                        {/* Botão Adicionar Lead na Coluna */}
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
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-bold text-indigo-800">Editar Lead: {selectedLead.name}</h2>
                            <button onClick={closeLeadModal} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Formulário de Edição */}
                        <div className="space-y-4">
                            {/* Nome, Telefone, Documento, UC */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" name="name" className="w-full border rounded px-3 py-2" value={selectedLead.name || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="text" name="phone" className="w-full border rounded px-3 py-2" value={selectedLead.phone || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label><input type="text" name="document" className="w-full border rounded px-3 py-2" value={selectedLead.document || ''} onChange={handleInputChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">UC</label><input type="text" name="uc" className="w-full border rounded px-3 py-2" value={selectedLead.uc || ''} onChange={handleInputChange} /></div>
                            </div>
                            
                            {/* Endereço, Origem, Consumo, Status */}
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
                                        selectedLead.notes
                                            // Converte strings simples em objetos para ordenação se o backend retornar apenas strings
                                            .map(note => typeof note === 'string' ? { text: note, timestamp: Date.now() } : note) 
                                            // Ordena por data (mais recente primeiro)
                                            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                                            .map((note, index) => (
                                                <div key={index} className="mb-2 p-2 border-b last:border-b-0 text-sm">
                                                    <p className="font-semibold text-indigo-600 text-xs">
                                                        {formatNoteDate(note.timestamp || null)}
                                                    </p>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{note.text || note}</p>
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