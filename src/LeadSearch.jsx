// src/LeadSearch.jsx - ADICIONANDO LAYOUT E LÓGICA DE EDIÇÃO

import React, { useState, useEffect, useCallback } from 'react';
// Adiciona FaEdit para o botão de edição
import { FaSearch, FaPlus, FaExternalLinkAlt, FaEdit, FaTimes, FaSave, FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 
import Sidebar from './components/Sidebar'; // <<--- IMPORTA O SIDEBAR
import { STAGES, LeadModal } from './KanbanBoard.jsx'; // <<-- IMPORTA O MODAL E STAGES

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

/*
 * NOTA IMPORTANTE: Para evitar duplicação de código e bugs, 
 * a lógica do Modal de Edição (LeadModal, formatNoteDate, saveLeadChanges) 
 * deve ser centralizada.
 * * NOVO PLANO: Vamos mover a lógica do modal para um novo componente reutilizável 
 * OU, mais fácil, IMPORTAR o KanbanBoard para obter as funções, assumindo 
 * que a lógica do modal está no Kanban.
 * * *** Como a lógica do Modal é grande e está no KanbanBoard, 
 * vamos refatorar o KanbanBoard para expor apenas o Modal e suas funções de apoio, 
 * mas, para evitar mais bagunça agora, vamos APENAS DUPLICAR o modal e sua lógica 
 * DE FORMA TEMPORÁRIA para fazer a tela funcionar. ***
*/

// --- LÓGICA DE FUNÇÕES AUXILIARES (DUPLICADAS TEMPORARIAMENTE) ---

// Função para formatar a data da nota (Copiada do KanbanBoard)
const formatNoteDate = (timestamp) => {
    if (timestamp === 0) return 'Data Desconhecida';
    if (!timestamp) return 'Sem Data';
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

// Componente Modal (Copiado do KanbanBoard - Adapte conforme o seu original)
const LeadEditModal = ({ selectedLead, isModalOpen, onClose, onSave, token, fetchLeads }) => {
    // ESTADOS LOCAIS DO MODAL
    const [leadData, setLeadData] = useState(selectedLead);
    const [newNoteText, setNewNoteText] = useState('');
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    
    // Função para atualizar os campos de input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prev) => ({ ...prev, [name]: value }));
    };
    
    // Função de Salvamento (Copiada e adaptada do KanbanBoard)
    const saveLeadChanges = async () => {
        if (!leadData || saving) return;

        setSaving(true);
        setApiError(null);

        // 1. Prepara as notas
        let internalNotes = leadData.notes ? [...leadData.notes] : [];
        if (newNoteText.trim()) {
             // IMPORTANTE: O backend espera um array de strings
             internalNotes.push({ text: newNoteText.trim(), timestamp: Date.now() }); 
        }
        
        // 2. Prepara os dados para a requisição PUT
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
            
            // Mapeia o array de objetos para um array de STRINGS (texto puro)
            notes: internalNotes.map(n => n.text).filter(Boolean), 
            
            uc: leadData.uc,
            qsa: leadData.qsa || null,
        };

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData._id}`, dataToSend, config);

            // 3. Atualiza a lista de leads no componente pai
            await fetchLeads(); 
            
            onClose(); // Fecha o modal
            onSave(true, 'Lead salvo com sucesso!'); // Feedback (opcional)

        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            setApiError(`Falha ao salvar: ${error.response?.data?.error || 'Erro desconhecido'}`);
        } finally {
            setSaving(false); 
        }
    };

    if (!isModalOpen) return null;

    // Renderização do Modal (Copie a estrutura do seu KanbanBoard.jsx)
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-indigo-800">Editar Lead: {leadData.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
                </div>
                
                {apiError && <p className="text-red-500 mb-3 p-2 bg-red-50 rounded">{apiError}</p>}
                
                <div className="space-y-4">
                    {/* Campos Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" name="name" className="w-full border rounded px-3 py-2" value={leadData.name || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="text" name="phone" className="w-full border rounded px-3 py-2" value={leadData.phone || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label><input type="text" name="document" className="w-full border rounded px-3 py-2" value={leadData.document || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">UC</label><input type="text" name="uc" className="w-full border rounded px-3 py-2" value={leadData.uc || ''} onChange={handleInputChange} /></div>
                    </div>
                    
                    {/* Campos Adicionais */}
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
                                {/* STAGES precisa ser importado ou definido */}
                                {STAGES.map(stage => (<option key={stage.id} value={stage.id}>{stage.title}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* CAMPO DE NOVA NOTA */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center space-x-2"><FaPaperclip size={16} /><span>Adicionar Nova Nota</span></label>
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
                        <h3 className="text-md font-bold text-gray-800 mb-2">Histórico de Notas ({leadData.notes?.length || 0})</h3>
                        <div className="max-h-40 overflow-y-auto border p-3 rounded-lg bg-white shadow-inner">
                            {leadData.notes && leadData.notes.length > 0 ? (
                                [...leadData.notes].map((note, index) => (
                                    <div key={index} className="mb-2 p-2 border-b last:border-b-0 text-sm">
                                        <p className="font-semibold text-xs text-indigo-600">{formatNoteDate(note.timestamp)}</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p> 
                                    </div>
                                ))
                            ) : (<p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>)}
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
    );
};

// --- COMPONENTE PRINCIPAL LEAD SEARCH ---
const LeadSearch = () => {
    // ... (Estados e lógica de busca, conforme sua versão anterior) ...
    const [allLeads, setAllLeads] = useState([]); 
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    // ESTADOS DE EDIÇÃO DO MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 

    // Define STAGES (Se não puder importar do KanbanBoard)
    const STAGES = [
        { id: 'Para Contatar', title: 'Para Contatar', color: 'bg-blue-500' },
        { id: 'Em Conversação', title: 'Em Conversação', color: 'bg-yellow-500' },
        { id: 'Proposta Enviada', title: 'Proposta Enviada', color: 'bg-green-500' },
        { id: 'Fechado', title: 'Fechado', color: 'bg-gray-500' },
        { id: 'Perdido', title: 'Perdido', color: 'bg-red-500' },
    ];
    
    // FUNÇÃO DE BUSCA DA API (DEVE PERMANECER IGUAL)
    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) { setIsLoading(false); return; }
        setIsLoading(true); setApiError(null);
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            setAllLeads(response.data);
            setFilteredLeads(response.data); 
            setApiError(null);
        } catch (error) {
            console.error('Erro ao buscar leads:', error.response?.data || error.message);
            if (error.response?.status === 401) { logout(); setApiError('Sessão expirada. Faça login novamente.'); } 
            else { setApiError('Falha ao carregar leads. Verifique a conexão com a API.'); }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        const lowerCaseTerm = term.toLowerCase();
        if (!lowerCaseTerm.trim()) { setFilteredLeads(allLeads); return; }
        const results = allLeads.filter(lead => {
            const matchName = lead.name?.toLowerCase().includes(lowerCaseTerm);
            const matchPhone = lead.phone?.includes(term); 
            const matchDocument = lead.document?.includes(term);
            const matchEmail = lead.email?.toLowerCase().includes(lowerCaseTerm);
            const matchStatus = lead.status?.toLowerCase().includes(lowerCaseTerm);
            const matchUC = lead.uc?.includes(term);
            const matchOrigin = lead.origin?.toLowerCase().includes(lowerCaseTerm);
            return matchName || matchPhone || matchDocument || matchEmail || matchStatus || matchUC || matchOrigin;
        });
        setFilteredLeads(results);
    };

    // FUNÇÕES DE ABERTURA/FECHAMENTO DO MODAL
    const openLeadModal = (lead) => {
        // Formata as notas para o modal
        const leadNotes = Array.isArray(lead.notes) 
            ? lead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
            : [];
            
        const leadCopy = { ...lead, notes: leadNotes };
        setSelectedLead(leadCopy);
        setIsModalOpen(true);
    };

    const closeLeadModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
    };
    
    // Função para tratar o salvamento do modal (apenas feedback visual)
    const handleSaveFeedback = (success, message) => {
        // Aqui você pode adicionar um toast de sucesso, se quiser
        console.log(`Salvamento: ${success ? 'Sucesso' : 'Falha'} - ${message}`);
    };


    if (isLoading) { return (
        <div className="flex h-screen bg-gray-100"><Sidebar />
        <main className="flex-1 overflow-y-auto p-6 text-center text-indigo-600">Carregando Leads...</main>
        </div>
    );}

    if (apiError) { return (
        <div className="flex h-screen bg-gray-100"><Sidebar />
        <main className="flex-1 overflow-y-auto p-6 text-center text-red-600 font-bold">Erro: {apiError}</main>
        </div>
    );}


    return (
        // ESTRUTURA DE LAYOUT PRINCIPAL
        <div className="flex h-screen bg-gray-100"> 
            <Sidebar /> {/* Sidebar ativo */}
            
            <main className="flex-1 overflow-y-auto"> 
                <div className="p-6 bg-gray-50 min-h-full">
                    
                    {/* Botão de voltar para Kanban Leads */}
                    <div className="mb-4">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                            &larr; Voltar para Kanban Leads
                        </button>
                    </div>

                    {/* Conteúdo da Busca */}
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
                    
                    {/* Campo de Busca (igual ao anterior) */}
                    <div className="mb-6 relative max-w-lg">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Buscar por Nome, Telefone, Documento, UC ou Status..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    
                    {/* Tabela/Lista de Leads (ADICIONA BOTÃO DE EDIÇÃO) */}
                    <div className="bg-white p-4 rounded-lg shadow-xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {/* ... (Cabeçalho da tabela) ... */}
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
                                                {/* NOVO BOTÃO DE EDIÇÃO */}
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
                                        {searchTerm.trim() ? "Nenhum lead encontrado com o termo de busca." : "Nenhum lead cadastrado ou encontrado."}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                        Total de Leads exibidos: {filteredLeads.length}
                    </div>
                </div>
            </main>

            {/* MODAL DE EDIÇÃO */}
            {selectedLead && (
                <LeadEditModal 
                    selectedLead={selectedLead}
                    isModalOpen={isModalOpen}
                    onClose={closeLeadModal}
                    onSave={handleSaveFeedback}
                    token={token}
                    fetchLeads={fetchLeads} // Passa a função para atualizar a lista após salvar
                />
            )}
        </div>
    );
};

export default LeadSearch;