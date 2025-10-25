// src/components/LeadEditModal.jsx - CÓDIGO FINAL COM CORES AJUSTADAS PARA O TEMA VERDE

import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaPlus } from 'react-icons/fa';
import axios from 'axios';
// Importa STAGES do KanbanBoard
import { STAGES } from '../KanbanBoard.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';


// --- FUNÇÕES AUXILIARES --- (Mantida)

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
    const [newNoteText, setNewNoteText] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    // Efeito para sincronizar `leadData` quando `selectedLead` muda
    useEffect(() => {
        if (selectedLead) {
            setLeadData(selectedLead);
        }
    }, [selectedLead]);
    
    if (!isModalOpen || !selectedLead) return null;

    // Handlers
    const handleChange = (e) => {
        setLeadData({
            ...leadData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = { ...leadData };
            
            await axios.put(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}`, dataToSave, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSave(true, `Lead ${selectedLead.name} atualizado.`);
            onClose();
            fetchLeads(); // Recarrega a lista
        } catch (error) {
            onSave(false, 'Falha ao salvar alterações.');
            console.error('Erro ao salvar lead:', error.response?.data?.error || error.message);
        } finally {
            setSaving(false);
        }
    };
    
    // Função para adicionar uma nova nota
    const handleAddNote = async () => {
        if (!newNoteText.trim()) return;

        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}/notes`, 
                { text: newNoteText.trim() }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Atualiza o estado local do modal
            setLeadData(prev => ({
                ...prev,
                notes: response.data.notes,
            }));
            
            setNewNoteText('');
            onSave(true, 'Nota adicionada com sucesso.');
            fetchLeads(); // Recarregar leads para refletir a nova nota
        } catch (error) {
            onSave(false, 'Falha ao adicionar nota.');
            console.error('Erro ao adicionar nota:', error);
        }
    };
    
    // Função para upload de anexo
    const handleAttachmentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('attachment', file);
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/leads/${selectedLead._id}/attachments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Atualiza o estado local do modal com a nota de anexo
            setLeadData(prev => ({
                ...prev,
                notes: response.data.notes, // A API deve retornar a lista de notas atualizada, incluindo o anexo
            }));
            
            onSave(true, `Anexo '${file.name}' enviado com sucesso.`);
            fetchLeads();
        } catch (error) {
            onSave(false, 'Falha ao enviar anexo.');
            console.error('Erro ao enviar anexo:', error);
        } finally {
            setUploading(false);
            // Reseta o input de arquivo para permitir novo upload do mesmo arquivo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        // Overlay do Modal
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Lead: {selectedLead.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
                </div>
                
                {/* GRID DE INFORMAÇÕES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    
                    {/* Coluna 1: Dados Principais */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Dados</h3>
                        <select name="status" value={leadData.status || ''} onChange={handleChange} 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        >
                            {Object.keys(STAGES).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <input name="name" type="text" value={leadData.name || ''} onChange={handleChange} placeholder="Nome" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                        <input name="email" type="email" value={leadData.email || ''} onChange={handleChange} placeholder="Email" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                        <input name="phone" type="text" value={leadData.phone || ''} onChange={handleChange} placeholder="Telefone" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                        <input name="uc" type="text" value={leadData.uc || ''} onChange={handleChange} placeholder="UC" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                        <input name="avgConsumption" type="number" value={leadData.avgConsumption || ''} onChange={handleChange} placeholder="Consumo Médio (kWh)" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                        <input name="estimatedSavings" type="text" value={leadData.estimatedSavings || ''} onChange={handleChange} placeholder="Economia Estimada" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                        <input name="qsa" type="text" value={leadData.qsa || ''} onChange={handleChange} placeholder="QSA" 
                            // AJUSTE DE FOCO: green-500
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 transition"
                        />
                    </div>
                    
                    {/* Coluna 2: Notas e Anexos */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-1">Notas e Histórico</h3>
                        
                        {/* Adicionar Nova Nota */}
                        <div className="flex space-x-2">
                            <textarea 
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                placeholder="Adicionar nova nota..."
                                // AJUSTE DE FOCO: green-500
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 min-h-[50px]"
                            />
                            <button 
                                onClick={handleAddNote}
                                // AJUSTE DE COR: green-600
                                className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition self-start"
                                disabled={!newNoteText.trim()}
                            >
                                <FaPlus />
                            </button>
                        </div>
                        
                        {/* Anexo */}
                        <div className="flex space-x-2 items-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAttachmentUpload}
                                className="hidden"
                                id="attachment-upload"
                                disabled={uploading}
                            />
                            <label htmlFor="attachment-upload" 
                                // AJUSTE DE COR: green-600
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium shadow-md cursor-pointer transition ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                <FaPaperclip size={16} />
                                <span>{uploading ? 'Enviando...' : 'Adicionar Anexo'}</span>
                            </label>
                        </div>

                        {/* Histórico de Notas (Read-only) */}
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                            <h3 className="font-semibold mb-2 text-gray-700 border-b border-gray-200 pb-1">Histórico</h3>
                            <div className="space-y-3">
                                {leadData.notes && Array.isArray(leadData.notes) && leadData.notes.length > 0 ? (
                                    // Inverte a ordem para mostrar o mais recente primeiro
                                    leadData.notes.slice().reverse().map((note, index) => {
                                        const noteText = note.text || note.fileUrl || note.fileName;
                                        const noteTimestamp = note.timestamp || Date.now();
                                        const isAttachment = note.fileUrl || (note.fileName && !note.text);
                                        
                                        return (
                                            <div key={index} className={`border-l-4 ${isAttachment ? 'border-yellow-400' : 'border-gray-300'} pl-3`}>
                                                {/* AJUSTE DE COR: indigo-600 -> green-600 */}
                                                <p className="font-semibold text-xs text-green-600">{formatNoteDate(noteTimestamp)}</p>
                                                <p className={`text-gray-700 whitespace-pre-wrap ${isAttachment ? 'font-medium text-yellow-800' : ''}`}>
                                                    {isAttachment ? `Anexo: ${note.fileName}` : noteText}
                                                    {isAttachment && note.fileUrl && (
                                                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                                                            (Ver Arquivo)
                                                        </a>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (<p className="text-gray-500 text-sm italic">Nenhuma nota registrada.</p>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                    <button 
                        type="button"
                        onClick={handleSave} 
                        disabled={saving} 
                        // AJUSTE DE COR: indigo-600 -> green-600 / hover:bg-indigo-700 -> hover:bg-green-700
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 flex items-center space-x-2"
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