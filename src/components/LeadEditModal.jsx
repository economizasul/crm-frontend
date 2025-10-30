import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { STAGES } from '../KanbanBoard.jsx';
import { useAuth } from '../../AuthContext'; // Ajuste o caminho se necessário

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

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

const LeadEditModal = ({ selectedLead, isModalOpen, onClose, onSave, token, fetchLeads }) => {
    const { user } = useAuth(); // Pega usuário logado com permissões
    const [leadData, setLeadData] = useState(selectedLead || {});
    const [newNoteText, setNewNoteText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    // NOVO: Estados para transferência
    const [vendedores, setVendedores] = useState([]);
    const [novoDonoId, setNovoDonoId] = useState('');

    useEffect(() => {
        if (selectedLead) {
            const leadNotes = Array.isArray(selectedLead.notes)
                ? selectedLead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
                : [];

            setLeadData({ ...selectedLead, notes: leadNotes });
            setNewNoteText('');
            setSelectedFile(null);
            setApiError(null);
            setNovoDonoId(''); // Limpa seleção de transferência

            // Carregar lista de vendedores (exceto o próprio)
            const carregarVendedores = async () => {
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/v1/users`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setVendedores(res.data.filter(u => u.id !== user?.id && u.role !== 'Admin'));
                } catch (err) {
                    console.error('Erro ao carregar vendedores', err);
                }
            };

            if (user?.transferencia_leads) {
                carregarVendedores();
            }
        }
    }, [selectedLead, token, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0] || null);
    };

    const handleAddNewNote = () => {
        if (!newNoteText.trim() && !selectedFile) return;

        let notesArray = leadData.notes ? [...leadData.notes] : [];

        if (newNoteText.trim()) {
            notesArray.push({ text: newNoteText.trim(), timestamp: Date.now() });
        }

        if (selectedFile) {
            const fileNameNote = `[ANEXO REGISTRADO: ${selectedFile.name}]`;
            notesArray.push({ text: fileNameNote, timestamp: Date.now(), isAttachment: true });
        }

        setLeadData((prev) => ({ ...prev, notes: notesArray }));
        setNewNoteText('');
        setSelectedFile(null);

        const fileInput = document.getElementById('attachment-input');
        if (fileInput) fileInput.value = '';
    };

    // NOVA FUNÇÃO: Transferir lead
    const transferirLead = async () => {
        if (!novoDonoId || novoDonoId === leadData.owner_id) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(
                `${API_BASE_URL}/api/v1/leads/${leadData._id}`,
                { owner_id: novoDonoId },
                config
            );

            setLeadData(prev => ({ ...prev, owner_id: novoDonoId }));
            setNovoDonoId('');
            alert('Lead transferido com sucesso!');
            fetchLeads();
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            alert('Erro ao transferir lead: ' + msg);
        }
    };

    const saveLeadChanges = async () => {
        if (!leadData || saving) return;

        setSaving(true);
        setApiError(null);

        let internalNotes = leadData.notes ? [...leadData.notes] : [];

        if (newNoteText.trim() && !internalNotes.some(n => n.text === newNoteText.trim())) {
            internalNotes.push({ text: newNoteText.trim(), timestamp: Date.now() });
        }
        if (selectedFile && !internalNotes.some(n => n.text.includes(selectedFile.name))) {
            const fileNameNote = `[ANEXO REGISTRADO: ${selectedFile.name}]`;
            internalNotes.push({ text: fileNameNote, timestamp: Date.now(), isAttachment: true });
        }

        const notesToSend = internalNotes.map(n => typeof n === 'string' ? n : n.text).filter(Boolean);

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
            notes: notesToSend,
            uc: leadData.uc,
            qsa: leadData.qsa || null,
            owner_id: leadData.owner_id // Mantém o dono atual
        };

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData._id}`, dataToSend, config);

            await fetchLeads();
            onClose();
            onSave(true, 'Lead salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            const serverError = error.response?.data?.error || 'Erro desconhecido';
            setApiError(`Falha ao salvar: ${serverError}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isModalOpen) return null;

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

                    {/* TRANSFERÊNCIA DE LEAD */}
                    {user?.transferencia_leads && leadData.owner_id === user.id && (
                        <div className="mt-6 p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                            <label className="block text-sm font-bold text-green-800 mb-2">
                                Transferir Lead para outro vendedor:
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={novoDonoId}
                                    onChange={(e) => setNovoDonoId(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Selecione um vendedor...</option>
                                    {vendedores.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} ({v.email})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={transferirLead}
                                    disabled={!novoDonoId}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Transferir
                                </button>
                            </div>
                            <p className="text-xs text-green-600 mt-2">
                                Apenas seus leads podem ser transferidos.
                            </p>
                        </div>
                    )}

                    {/* Quadro de Adicionar Nova Nota / Anexo */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center space-x-2"><FaPaperclip size={16} /><span>Adicionar Novo Atendimento / Anexo</span></label>
                        <textarea
                            rows={3}
                            name="newNoteText"
                            className="w-full border rounded px-3 py-2 mb-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Descreva o atendimento ou a anotação aqui..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                        />
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
                        <button
                            type="button"
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
                                [...leadData.notes].reverse().map((note, index) => {
                                    const noteText = typeof note === 'string' ? note : (note.text || '');
                                    const noteTimestamp = typeof note === 'string' ? 0 : (note.timestamp || 0);
                                    const isAttachment = noteText.startsWith('[ANEXO REGISTRADO:');
                                    const noteClass = isAttachment
                                        ? "mb-2 p-2 border-l-4 border-yellow-500 bg-yellow-50 text-sm"
                                        : "mb-2 p-2 border-b last:border-b-0 text-sm";

                                    return (
                                        <div key={index} className={noteClass}>
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

                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                    <button
                        type="button"
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

export default LeadEditModal;