import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaPlus } from 'react-icons/fa';
import axios from 'axios';
// Importa STAGES do KanbanBoard
import { STAGES } from '../KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';


// --- FUNÇÕES AUXILIARES (Mantidas) ---

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

// Função de debounce para otimizar as chamadas à API (Mantida)
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};


// --- COMPONENTE LEAD EDIT MODAL (Layout Atualizado) ---

const LeadEditModal = ({ selectedLead, isModalOpen, onClose, onSave, token, fetchLeads }) => {
    // Inicializa o estado com o lead selecionado ou um objeto vazio
    const [leadData, setLeadData] = useState(selectedLead || {});
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    
    // Efeito para recarregar os dados do lead sempre que o 'selectedLead' externo mudar
    useEffect(() => {
        if (selectedLead) {
            setLeadData(selectedLead);
        }
    }, [selectedLead]);

    // Se o modal não estiver aberto, não renderiza nada
    if (!isModalOpen) return null;

    // Lógica para salvar as alterações do lead (MANTIDA)
    const saveLeadChanges = async () => {
        if (saving) return;

        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Cria um objeto com os dados que podem ser atualizados
            const dataToUpdate = {
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                company: leadData.company,
                status: leadData.status,
                // Outros campos relevantes para edição
            };

            await axios.put(
                `${API_BASE_URL}/api/v1/leads/${leadData.id}`,
                dataToUpdate,
                config
            );

            onSave(true, 'Lead atualizado com sucesso!');
            onClose(); // Fecha o modal
        } catch (error) {
            console.error('Erro ao salvar o lead:', error);
            onSave(false, 'Falha ao atualizar o lead.');
        } finally {
            setSaving(false);
        }
    };
    
    // Lógica para adicionar uma nova nota (MANTIDA)
    const handleAddNote = async () => {
        if (!newNote.trim() || isSavingNote) return;

        setIsSavingNote(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const noteData = {
                text: newNote.trim(),
                // A timestamp será gerada pelo backend, mas é bom ter um placeholder
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/v1/leads/${leadData.id}/notes`,
                noteData,
                config
            );
            
            // Atualiza o estado local do modal com a nova nota retornada pelo backend
            setLeadData(prev => ({
                ...prev,
                notes: [response.data.note, ...prev.notes], // Adiciona a nota no topo
            }));
            
            setNewNote('');
            // onSave(true, 'Nota adicionada com sucesso!'); // Não exibir toast de sucesso para notas
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
            // onSave(false, 'Falha ao adicionar nota.');
        } finally {
            setIsSavingNote(false);
        }
    };


    // Função auxiliar para atualização dos inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({ ...prev, [name]: value }));
    };

    // --- Renderização do Modal (Layout Atualizado) ---

    // Classes comuns para inputs (Atualizado com foco Indigo)
    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";


    return (
        // Overlay (fundo escuro)
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose} // Fecha ao clicar fora
        >
            {/* Corpo do Modal */}
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Impede que o clique interno feche
            >
                {/* Cabeçalho do Modal (Atualizado com tema Indigo) */}
                <div className="flex justify-between items-center p-5 border-b border-indigo-100 bg-indigo-600 text-white rounded-t-2xl">
                    <h2 className="text-xl font-bold">Editar Lead: {leadData.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-indigo-700 transition duration-150">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Conteúdo Principal (Scroll interno) */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Coluna de Dados do Lead (2/3 da largura em telas maiores) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">Informações Principais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome */}
                            <div>
                                <label htmlFor="name" className={labelClass}>Nome</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    value={leadData.name || ''} 
                                    onChange={handleInputChange} 
                                    className={inputClass}
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className={labelClass}>Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={leadData.email || ''} 
                                    onChange={handleInputChange} 
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Telefone */}
                            <div>
                                <label htmlFor="phone" className={labelClass}>Telefone</label>
                                <input 
                                    type="text" 
                                    id="phone" 
                                    name="phone" 
                                    value={leadData.phone || ''} 
                                    onChange={handleInputChange} 
                                    className={inputClass}
                                />
                            </div>
                            {/* Empresa */}
                            <div>
                                <label htmlFor="company" className={labelClass}>Empresa</label>
                                <input 
                                    type="text" 
                                    id="company" 
                                    name="company" 
                                    value={leadData.company || ''} 
                                    onChange={handleInputChange} 
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Status (Etapa do Kanban) */}
                        <div>
                            <label htmlFor="status" className={labelClass}>Status (Etapa do Kanban)</label>
                            <select
                                id="status"
                                name="status"
                                value={leadData.status || ''}
                                onChange={handleInputChange}
                                className={inputClass}
                            >
                                {Object.keys(STAGES).map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Outros campos de formulário podem ser adicionados aqui */}
                        
                    </div>

                    {/* Coluna de Notas (1/3 da largura em telas maiores) */}
                    <div className="lg:col-span-1 border-l lg:pl-6 border-gray-200">
                        <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-4">Notas e Histórico</h3>
                        
                        {/* Adicionar Nova Nota */}
                        <div className="mb-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                            <textarea
                                placeholder="Adicionar nova nota..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows="3"
                                className={`${inputClass} mb-2`}
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={isSavingNote || !newNote.trim()}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition duration-200"
                            >
                                <FaPlus size={14} />
                                <span>{isSavingNote ? 'Salvando...' : 'Adicionar Nota'}</span>
                            </button>
                        </div>

                        {/* Lista de Notas */}
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {Array.isArray(leadData.notes) && leadData.notes.length > 0 ? (
                                leadData.notes.sort((a, b) => b.timestamp - a.timestamp).map((note, index) => {
                                    const noteText = note.text;
                                    const noteTimestamp = note.timestamp;
                                    const isAttachment = noteText.startsWith('[ANEXO:');

                                    return (
                                        // Estilo de nota atualizado
                                        <div key={index} className={`p-3 rounded-lg border ${isAttachment ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'} shadow-sm`}>
                                            <p className="font-semibold text-xs text-indigo-600 mb-1">{formatNoteDate(noteTimestamp)}</p>
                                            <p className={`text-gray-700 whitespace-pre-wrap ${isAttachment ? 'font-medium text-yellow-800' : ''}`}>
                                                {isAttachment ? <FaPaperclip className="inline mr-2" /> : ''}
                                                {noteText}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (<p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>)}
                        </div>
                    </div>
                </div>

                {/* Botões de Ação (Atualizados com tema Indigo) */}
                <div className="p-5 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200">Cancelar</button>
                    <button 
                        type="button"
                        onClick={saveLeadChanges} 
                        disabled={saving} 
                        // Botão principal com tema Indigo
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center space-x-2 shadow-md transition duration-200"
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