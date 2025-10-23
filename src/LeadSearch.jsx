// src/LeadSearch.jsx - CÓDIGO FINAL COM CORREÇÃO DE ERRO DE BUILD (Invalid assignment target)

import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FaSearch, FaPlus, FaEdit, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import Sidebar from './components/Sidebar'; 
import { STAGES } from './KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// --- FUNÇÕES AUXILIARES (Modal e Notas) ---

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

// Componente Modal de Edição (ATUALIZADO com Botão de Nota e Anexos)
const LeadEditModal = ({ selectedLead, isModalOpen, onClose, onSave, token, fetchLeads }) => {
    const [leadData, setLeadData] = useState(selectedLead);
    const [newNoteText, setNewNoteText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // Estado para anexo
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    
    useEffect(() => {
        if (selectedLead) {
            setLeadData(selectedLead);
            setNewNoteText('');
            setSelectedFile(null); // Limpa o arquivo selecionado
            setApiError(null);
        }
    }, [selectedLead]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prev) => ({ ...prev, [name]: value }));
    };
    
    // Função para adicionar a nota e/ou anexo ao histórico
    const handleAddNewNote = () => {
        if (!newNoteText.trim() && !selectedFile) return;

        let noteToAdd = newNoteText.trim();
        let notesArray = leadData.notes ? [...leadData.notes] : [];

        // 1. Adiciona o texto da nota, se houver
        if (noteToAdd) {
            notesArray.push({ text: noteToAdd, timestamp: Date.now() });
        }

        // 2. Adiciona a "nota" de anexo, se houver um arquivo (SIMULAÇÃO)
        if (selectedFile) {
             const fileNameNote = `[ANEXO REGISTRADO: ${selectedFile.name}]`;
             // A flag isAttachment ajuda o frontend a estilizar
             notesArray.push({ text: fileNameNote, timestamp: Date.now(), isAttachment: true });
        }
        
        // Atualiza o estado do lead e limpa os campos
        setLeadData((prev) => ({ ...prev, notes: notesArray }));
        setNewNoteText('');
        setSelectedFile(null); // Limpa o campo de anexo
        
        // CORREÇÃO APLICADA AQUI: Evita o Optional Chaining na atribuição
        const fileInput = document.getElementById('attachment-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };
    
    // Função para lidar com o upload de arquivo
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0] || null);
    };


    const saveLeadChanges = async () => {
        if (!leadData || saving) return;

        setSaving(true);
        setApiError(null);

        // O array de notes para o backend é o leadData.notes ATUALIZADO
        let internalNotes = leadData.notes ? [...leadData.notes] : [];
        
        // Verificação final caso o usuário tenha digitado/selecionado e não clicado em "Adicionar Nota ao Histórico"
        if (newNoteText.trim() || selectedFile) {
            if (newNoteText.trim()) {
                internalNotes.push({ text: newNoteText.trim(), timestamp: Date.now() });
            }
            if (selectedFile) {
                const fileNameNote = `[ANEXO REGISTRADO: ${selectedFile.name}]`;
                internalNotes.push({ text: fileNameNote, timestamp: Date.now(), isAttachment: true });
            }
        }
        
        // O backend só aceita um array de STRINGS de notas, então mapeamos:
        const notesToSend = internalNotes.map(n => n.text).filter(Boolean);

        const dataToSend = {
            status: leadData.status, 
            name: leadData.name,
            phone: leadData.phone,
            document: leadData.document,
            address: leadData.address,
            origin: leadData.origin,
            email: leadData.email,
            avgConsumption: leadData.avgConsumption ? parseFloat(leadData.avgConsumption) : null,
            estimatedSavings: leadData.estimatedSavings ? parseFloat(leadData.estimatedSavings) : null,
            notes: notesToSend, // Envia o array de strings
            uc: leadData.uc,
            qsa: leadData.qsa || null,
        };

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData._id}`, dataToSend, config);

            await fetchLeads(); 
            onClose(); 
            onSave(true, 'Lead salvo com sucesso!'); 

        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            setApiError(`Falha ao salvar: ${error.response?.data?.error || 'Erro desconhecido'}`);
        } finally {
            setSaving(false); 
        }
    };

    if (!isModalOpen) return null;
    
    // Condição para habilitar o botão
    const canAddNewNote = newNoteText.trim() || selectedFile;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-indigo-800">Editar Lead: {leadData.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
                </div>
                
                {apiError && <p className="text-red-500 mb-3 p-2 bg-red-50 rounded">{apiError}</p>}
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" name="name" className="w-full border rounded px-3 py-2" value={leadData.name || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="text" name="phone" className="w-full border rounded px-3 py-2" value={leadData.phone || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label><input type="text" name="document" className="w-full border rounded px-3 py-2" value={leadData.document || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">UC</label><input type="text" name="uc" className="w-full border rounded px-3 py-2" value={leadData.uc || ''} onChange={handleInputChange} /></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input type="text" name="address" className="w-full border rounded px-3 py-2" value={leadData.address || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Origem</label><input type="text" name="origin" className="w-full border rounded px-3 py-2" value={leadData.origin || ''} onChange={handleInputChange} /></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Consumo Médio (kWh)</label>
                            <input type="number" name="avgConsumption" className="w-full border rounded px-3 py-2" value={leadData.avgConsumption || ''} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status (Fase do Kanban)</label>
                            <select name="status" className="w-full border rounded px-3 py-2" value={leadData.status || 'Para Contatar'} onChange={handleInputChange}>
                                {STAGES.map(stage => (<option key={stage.id} value={stage.id}>{stage.title}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* Quadro de Adicionar Nova Nota */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2"><FaPaperclip size={16} /><span>Adicionar Novo Atendimento / Anexo</span></label>
                        
                        {/* Campo de Texto da Nota */}
                        <textarea
                            rows={3}
                            name="newNoteText"
                            className="w-full border rounded px-3 py-2 mb-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Descreva o atendimento ou a anotação aqui..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                        />
                        
                        {/* Campo de Anexo (Upload) */}
                        <div className="mb-4">
                            <label htmlFor="attachment-input" className="block text-sm font-medium text-gray-700 mb-1">Anexo (Foto, PDF, etc.)</label>
                            <input
                                id="attachment-input"
                                type="file"
                                accept=".pdf,image/*"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={handleFileChange}
                            />
                            {selectedFile && (
                                <p className="mt-1 text-sm text-gray-600">Arquivo selecionado: {selectedFile.name}</p>
                            )}
                        </div>

                        {/* Botão para Adicionar Nota/Anexo */}
                        <button
                            onClick={handleAddNewNote}
                            disabled={!canAddNewNote}
                            className="px-4 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 transition duration-200 flex items-center space-x-2"
                        >
                            <FaPlus size={14} />
                            <span>Adicionar Nota ao Histórico</span>
                        </button>
                    </div>

                    {/* Histórico de Notas */}
                    <div>
                        <h3 className="text-md font-bold text-gray-800 mb-2">Histórico de Notas ({leadData.notes?.length || 0})</h3>
                        <div className="max-h-40 overflow-y-auto border p-3 rounded-lg bg-white shadow-inner">
                            {leadData.notes && leadData.notes.length > 0 ? (
                                // Reverte a ordem para mostrar as mais recentes primeiro
                                [...leadData.notes].reverse().map((note, index) => {
                                    // Verifica se a nota é um registro de anexo
                                    const isAttachment = note.text.startsWith('[ANEXO REGISTRADO:');
                                    const noteClass = isAttachment 
                                        ? "mb-2 p-2 border-l-4 border-yellow-500 bg-yellow-50 text-sm" 
                                        : "mb-2 p-2 border-b last:border-b-0 text-sm";
                                    
                                    return (
                                        <div key={index} className={noteClass}>
                                            <p className="font-semibold text-xs text-indigo-600">{formatNoteDate(note.timestamp)}</p>
                                            <p className={`text-gray-700 whitespace-pre-wrap ${isAttachment ? 'font-medium text-yellow-800' : ''}`}>
                                                {note.text}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (<p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>)}
                        </div>
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
    );
};

// 🚨 NOVO COMPONENTE: Extraído para evitar re-renderizações desnecessárias do Input
const LeadSearchContent = React.memo(({ 
    isLoading, apiError, navigate, 
    searchTerm, handleSearchChange, 
    filteredLeads, filterTerm, 
    openLeadModal 
}) => {
    if (isLoading) return <div className="p-6 text-center text-indigo-600">Carregando Leads...</div>;
    if (apiError) return <div className="p-6 text-center text-red-600 font-bold">Erro: {apiError}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            
            {/* Botão de voltar para Kanban Leads */}
            <div className="mb-4">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                >
                    &larr; <span>Voltar para Kanban Leads</span>
                </button>
            </div>

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">Busca e Lista de Leads</h1>
                <button 
                    onClick={() => navigate('/leads/cadastro')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                    <FaPlus size={14} />
                    <span>Novo Lead</span>
                </button>
            </div>
            
            {/* Campo de Busca - Agora está estável dentro de um componente memoizado */}
            <div className="mb-6 relative max-w-lg">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por Nome, Telefone, Documento, UC ou Status..." 
                    value={searchTerm} 
                    onChange={(e) => handleSearchChange(e.target.value)} 
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                />
            </div>
            
            {/* Tabela/Lista de Leads */}
            <div className="bg-white p-4 rounded-lg shadow-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <tr key={lead._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.uc || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'Fechado' ? 'bg-green-100 text-green-800' : lead.status === 'Perdido' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.origin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => openLeadModal(lead)} 
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                                        >
                                            <FaEdit size={14} />
                                            <span>Editar</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                {filterTerm.trim() ? "Nenhum lead encontrado com o termo de busca." : "Nenhum lead cadastrado ou encontrado."}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
                Total de Leads exibidos: {filteredLeads.length}
            </div>
        </div>
    );
});


// --- COMPONENTE PRINCIPAL LEAD SEARCH ---
const LeadSearch = () => {
    const [allLeads, setAllLeads] = useState([]); 
    
    // Estados Debounced (Inalterados)
    const [searchTerm, setSearchTerm] = useState(''); 
    const [filterTerm, setFilterTerm] = useState(''); 
    
    const [apiError, setApiError] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 
    
    // Função de Busca de Leads (Inalterada)
    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) { setIsLoading(false); return; }
        setIsLoading(true); setApiError(null);
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            setAllLeads(response.data);
            setApiError(null);
        } catch (error) {
            if (error.response?.status === 401) { logout(); setApiError('Sessão expirada. Faça login novamente.'); } 
            else { setApiError('Falha ao carregar leads. Verifique a conexão com a API.'); }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // EFEITO DEBOUNCE (Inalterado)
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilterTerm(searchTerm);
        }, 300); 

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); 

    // useMemo para filtragem (Inalterado)
    const filteredLeads = useMemo(() => {
        const term = filterTerm.trim(); 
        if (!term) {
            return allLeads;
        }

        const lowerCaseTerm = term.toLowerCase();

        return allLeads.filter(lead => {
            const matchName = lead.name?.toLowerCase().includes(lowerCaseTerm);
            const matchPhone = lead.phone?.includes(term); 
            const matchDocument = lead.document?.includes(term);
            const matchEmail = lead.email?.toLowerCase().includes(lowerCaseTerm);
            const matchStatus = lead.status?.toLowerCase().includes(lowerCaseTerm);
            const matchUC = lead.uc?.includes(term);
            const matchOrigin = lead.origin?.toLowerCase().includes(lowerCaseTerm);
            
            return matchName || matchPhone || matchDocument || matchEmail || matchStatus || matchUC || matchOrigin;
        });
    }, [allLeads, filterTerm]);

    // Função de mudança do input (Inalterado)
    const handleSearchChange = (term) => {
        setSearchTerm(term);
    };

    // Funções do Modal (Inalteradas)
    const openLeadModal = useCallback((lead) => {
        const leadNotes = Array.isArray(lead.notes) 
            // Garante que as notas sejam objetos com text e timestamp para evitar erros de renderização/manipulação
            ? lead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
            : [];
            
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    }, []);

    const closeLeadModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
    }, []);
    
    const handleSaveFeedback = useCallback((success, message) => {
        console.log(`Salvamento: ${success ? 'Sucesso' : 'Falha'} - ${message}`);
    }, []);


    return (
        <div className="flex h-screen bg-gray-100"> 
            <Sidebar /> 
            
            <main className="flex-1 overflow-y-auto"> 
                {/* Usa o componente memoizado */}
                <LeadSearchContent 
                    isLoading={isLoading}
                    apiError={apiError}
                    navigate={navigate}
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                    filteredLeads={filteredLeads}
                    filterTerm={filterTerm}
                    openLeadModal={openLeadModal}
                />
            </main>

            {selectedLead && (
                <LeadEditModal 
                    selectedLead={selectedLead}
                    isModalOpen={isModalOpen}
                    onClose={closeLeadModal}
                    onSave={handleSaveFeedback}
                    token={token}
                    fetchLeads={fetchLeads}
                />
            )}
        </div>
    );
};

export default LeadSearch;