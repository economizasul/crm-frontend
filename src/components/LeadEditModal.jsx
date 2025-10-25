// src/components/LeadEditModal.jsx - CÓDIGO COMPLETO COM TEAL

import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaPlus } from 'react-icons/fa';
import axios from 'axios';
// Importa STAGES do KanbanBoard para a lista de estágios
import { STAGES } from '../KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';


// --- FUNÇÕES AUXILIARES ---

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

// --- COMPONENTE LEAD EDIT MODAL ---

const LeadEditModal = ({ selectedLead, isModalOpen, onClose, onSave, token, fetchLeads }) => {
    // Inicializa o estado com o lead selecionado ou um objeto vazio
    const [leadData, setLeadData] = useState(selectedLead || {});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [newNote, setNewNote] = useState('');
    // Estado para armazenar as notas formatadas
    const [notes, setNotes] = useState(selectedLead && Array.isArray(selectedLead.notes) ? selectedLead.notes : []);

    // Atualiza o estado interno quando o lead selecionado muda
    useEffect(() => {
        if (selectedLead) {
            setLeadData(selectedLead);
            setNotes(Array.isArray(selectedLead.notes) ? selectedLead.notes : []);
        } else {
            setLeadData({});
            setNotes([]);
        }
    }, [selectedLead]);


    const handleDataChange = (e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({ ...prev, [name]: value }));
    };

    const saveLeadChanges = async () => {
        if (!selectedLead || saving) return;

        setSaving(true);
        setApiError(null);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // 1. Atualizar dados do Lead
            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead.id}`, leadData, config);

            // 2. Adicionar nova nota, se houver
            if (newNote.trim()) {
                const notePayload = { text: newNote.trim() };
                await axios.post(`${API_BASE_URL}/api/v1/leads/${selectedLead.id}/notes`, notePayload, config);
            }

            // Opcional: Chama a função externa para feedback ou recarga
            onSave(true, `Lead ${selectedLead.name} atualizado.`);
            
            // Recarrega os leads na tela principal (Kanban ou Search)
            if(fetchLeads) fetchLeads(); 

            onClose(); // Fecha o modal
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Erro desconhecido ao salvar.";
            console.error("Erro ao salvar lead:", errorMessage);
            setApiError(`Falha ao salvar: ${errorMessage}`);
            onSave(false, `Falha ao salvar lead: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };


    if (!isModalOpen || !selectedLead) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            
            {/* O Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
                
                {/* Cabeçalho do Modal */}
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <h2 className="text-2xl font-semibold text-teal-600">Detalhes do Lead: {selectedLead.name}</h2> {/* TÍTULO: text-teal-600 */}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                {apiError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{apiError}</div>}


                {/* Corpo do Modal - Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1: Dados do Lead */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-teal-600">Dados Principais</h3> {/* SUBTÍTULO: text-teal-600 */}
                        
                        {/* Nome */}
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" id="name" name="name" value={leadData.name || ''} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        
                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" name="email" value={leadData.email || ''} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        
                        {/* Telefone */}
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                            <input type="text" id="phone" name="phone" value={leadData.phone || ''} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* Estágio */}
                        <div className="mb-4">
                            <label htmlFor="stage" className="block text-sm font-medium text-gray-700">Estágio</label>
                            <select id="stage" name="stage" value={leadData.stage || 'Novo'} onChange={handleDataChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                {Object.keys(STAGES).map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Coluna 2: Notas */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-teal-600">Notas e Anexos</h3> {/* SUBTÍTULO: text-teal-600 */}
                        
                        {/* Adicionar Nova Nota */}
                        <div className="mb-4">
                            <textarea
                                rows="2"
                                placeholder="Adicione uma nova nota..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        {/* Lista de Notas Existentes */}
                        <div className="space-y-4 max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50">
                            {notes.length > 0 ? (
                                notes.map((note, index) => {
                                    const noteText = note.text || 'Nota sem conteúdo.';
                                    const noteTimestamp = note.timestamp || 0;
                                    const isAttachment = noteText.toLowerCase().startsWith('[anexo]');

                                    return (
                                        <div key={index} className="border-b pb-2 last:border-b-0">
                                            <p className="font-semibold text-xs text-teal-600">{formatNoteDate(noteTimestamp)}</p> {/* DATA DA NOTA: text-teal-600 */}
                                            <p className={`text-gray-700 whitespace-pre-wrap ${isAttachment ? 'font-medium text-yellow-800' : ''}`}>
                                                {noteText}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (<p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>)}
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                    <button 
                        type="button"
                        onClick={saveLeadChanges} 
                        disabled={saving} 
                        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 flex items-center space-x-2" // BOTÃO SALVAR: bg-teal-600
                    >
                        <FaSave size={16} />
                        <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadEditModal;