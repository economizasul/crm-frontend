// src/components/LeadEditModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaPlus } from 'react-icons/fa';
import axios from 'axios';
// Importa STAGES do KanbanBoard (caminho relativo corrigido)
import { STAGES } from '../KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';


// --- FUNÇÕES AUXILIARES ---

// Função de formatação de data
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
    // Inicializa o estado com o lead selecionado
    const [leadData, setLeadData] = useState(selectedLead || {});
    const [newNoteText, setNewNoteText] = useState('');
    const [saving, setSaving] = useState(false);

    // Efeito para sincronizar o estado local com a prop externa
    useEffect(() => {
        if (selectedLead) {
            // Garante que a nota é um array
            const notes = Array.isArray(selectedLead.notes) ? selectedLead.notes : [];
            setLeadData({ ...selectedLead, notes });
        }
    }, [selectedLead]);

    // Lida com a mudança de campos de input/select
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // Adiciona uma nova nota (apenas localmente)
    const handleAddNote = useCallback(() => {
        if (newNoteText.trim() === '') return;
        
        const noteToAdd = {
            // Estrutura de nota esperada pelo backend (data no formato timestamp)
            text: newNoteText.trim(),
            timestamp: Date.now(),
        };

        setLeadData(prev => ({
            ...prev,
            notes: [...prev.notes, noteToAdd],
        }));
        setNewNoteText('');
    }, [newNoteText]);

    // Salva as alterações do lead e as notas no backend
    const saveLeadChanges = useCallback(async () => {
        if (!leadData.id) return onSave(false, "Erro: ID do Lead não encontrado.");

        setSaving(true);
        
        try {
            // Dados a enviar: Apenas os campos editáveis
            const dataToUpdate = {
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                stage: leadData.stage,
                priority: leadData.priority,
                notes: leadData.notes, // Envia o array completo de notas (existentes + novas)
            };

            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData.id}`, dataToUpdate, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            // Sucesso
            onSave(true, `Lead ${leadData.name} atualizado com sucesso!`);
            
            // Recarrega a lista principal de leads (Kanban ou LeadSearch)
            if (fetchLeads) {
                fetchLeads();
            }

            onClose(); // Fecha o modal
        } catch (error) {
            console.error("Erro ao salvar lead:", error);
            const errorMessage = error.response?.data?.error || "Erro ao salvar as alterações do lead.";
            onSave(false, errorMessage);
        } finally {
            setSaving(false);
        }
    }, [leadData, token, onClose, onSave, fetchLeads]);
    
    // Se o modal não estiver aberto, não renderiza nada
    if (!isModalOpen) return null;

    // Obtém as chaves dos estágios para o select
    const stageKeys = Object.keys(STAGES);

    return (
        // Modal Overlay
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={onClose} // Fecha ao clicar no overlay
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()} // Impede o fechamento ao clicar no conteúdo
            >
                {/* Header do Modal */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-indigo-700">Editar Lead: {leadData.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Corpo do Modal */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna de Dados do Lead */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Detalhes do Lead</h3>

                        <div className="space-y-4">
                            {/* Nome */}
                            <label className="block">
                                <span className="text-gray-700">Nome</span>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={leadData.name || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                />
                            </label>

                            {/* Email */}
                            <label className="block">
                                <span className="text-gray-700">Email</span>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={leadData.email || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                />
                            </label>
                            
                            {/* Telefone */}
                            <label className="block">
                                <span className="text-gray-700">Telefone</span>
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={leadData.phone || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                />
                            </label>

                            {/* Estágio */}
                            <label className="block">
                                <span className="text-gray-700">Estágio Atual</span>
                                <select
                                    name="stage"
                                    value={leadData.stage || stageKeys[0]}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                >
                                    {stageKeys.map(stage => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </label>

                            {/* Prioridade */}
                            <label className="block">
                                <span className="text-gray-700">Prioridade</span>
                                <select
                                    name="priority"
                                    value={leadData.priority || 'Baixa'}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                                >
                                    <option value="Baixa">Baixa</option>
                                    <option value="Média">Média</option>
                                    <option value="Alta">Alta</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {/* Coluna de Notas/Histórico */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Adicionar Nota</h3>

                        {/* Área para Adicionar Nova Nota */}
                        <div className="mb-4 p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
                            <textarea
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                rows="3"
                                placeholder="Registre uma nova interação ou observação..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                onClick={handleAddNote}
                                className="mt-2 flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                                disabled={newNoteText.trim() === ''}
                            >
                                <FaPlus size={12} />
                                <span>Adicionar</span>
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Histórico de Notas</h3>

                        {/* Lista de Notas */}
                        <div className="space-y-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
                            {leadData.notes && leadData.notes.length > 0 ? (
                                // Mapeia as notas em ordem inversa (mais recente primeiro)
                                [...leadData.notes].reverse().map((note, index) => {
                                    const noteText = note.text || note;
                                    const noteTimestamp = note.timestamp || 0;
                                    const isAttachment = noteText.toLowerCase().includes('[anexo'); 
                                    
                                    const key = `${noteTimestamp}-${leadData.notes.length - 1 - index}`; 
                                    
                                    return (
                                        <div key={key} className="p-3 bg-white border rounded-lg shadow-sm">
                                            <p className="font-semibold text-xs text-indigo-600">{formatNoteDate(noteTimestamp)}</p>
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
                <div className="mt-6 flex justify-end space-x-2 p-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">Cancelar</button>
                    <button 
                        type="button"
                        onClick={saveLeadChanges} 
                        disabled={saving} 
                        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center space-x-2 transition duration-200"
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