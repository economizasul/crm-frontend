import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaPlus, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'; 
import axios from 'axios';
import { STAGES } from '../KanbanBoard.jsx'; 
import { useAuth } from '../../AuthContext'; 

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
    const { user } = useAuth(); 
    const [leadData, setLeadData] = useState(selectedLead || {});
    const [newNoteText, setNewNoteText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    const [vendedores, setVendedores] = useState([]);
    const [novoDonoId, setNovoDonoId] = useState('');

    useEffect(() => {
        if (selectedLead) {
            const leadNotes = Array.isArray(selectedLead.notes)
                ? selectedLead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
                : (selectedLead.notes ? JSON.parse(selectedLead.notes).map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n) : []);

            // Mapeia snake_case do selectedLead para camelCase do state
            setLeadData({ 
                ...selectedLead, 
                avgConsumption: selectedLead.avg_consumption,
                estimatedSavings: selectedLead.estimated_savings,
                notes: leadNotes 
            });
            setNewNoteText('');
            setSelectedFile(null);
            setApiError(null);
            setNovoDonoId(''); 

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

    const transferirLead = async () => {
        if (!novoDonoId || novoDonoId === leadData.owner_id) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const leadIdentifier = leadData.id || leadData._id; 
            await axios.put(
                `${API_BASE_URL}/api/v1/leads/${leadIdentifier}`,
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

    // 🚨 FUNÇÃO CORRIGIDA: Salva as alterações do lead via modal
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
        
        // 🚨 CORREÇÃO: Cria o objeto dataToSend explicitamente, 
        // mapeando camelCase (frontend) para snake_case (backend/DB)
        const notesToSend = JSON.stringify(internalNotes.map(n => n.text).filter(Boolean));
        
        const dataToSend = {
            // Campos Diretos
            name: leadData.name,
            phone: leadData.phone,
            document: leadData.document,
            address: leadData.address,
            status: leadData.status,
            origin: leadData.origin,
            email: leadData.email,
            uc: leadData.uc,
            qsa: leadData.qsa,
            owner_id: leadData.owner_id, 
            lat: leadData.lat || null, 
            lng: leadData.lng || null,
            
            // Conversão de camelCase para snake_case
            avg_consumption: leadData.avgConsumption ? parseFloat(leadData.avgConsumption) : null,
            estimated_savings: leadData.estimatedSavings ? parseFloat(leadData.estimatedSavings) : null,
            
            // Notas (JSON String)
            notes: notesToSend, 
        };
        
        const leadIdentifier = leadData.id || leadData._id; 

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadIdentifier}`, dataToSend, config);

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
    
    // Função existente: Gerar o link do Google Maps
    const getGoogleMapsLink = () => {
        if (!leadData.address) return null;
        const encodedAddress = encodeURIComponent(leadData.address);
        return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    };
    
    // Função existente: Gerar o link do WhatsApp
    const getWhatsAppLink = () => {
        if (!leadData.phone) return null;
        const onlyNumbers = leadData.phone.replace(/[\D]/g, '');
        const formattedPhone = onlyNumbers.startsWith('55') ? onlyNumbers : `55${onlyNumbers}`;
        
        const initialMessage = `Olá, ${leadData.name || 'Lead'}, estou entrando em contato a respeito da sua proposta de energia solar.`;
        const encodedMessage = encodeURIComponent(initialMessage);

        return `http://googleusercontent.com/wa.me/${formattedPhone}?text=${encodedMessage}`;
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
                    
                    {/* Container para os links */}
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
                            <select name="status" className="w-full border rounded px-3 py-2" value={leadData.status || 'Novo'} onChange={handleInputChange}>
                                {Object.keys(STAGES).map(statusKey => (<option key={statusKey} value={statusKey}>{statusKey}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* TRANSFERÊNCIA DE LEAD (inalterado) */}
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

                    {/* Quadro de Adicionar Nova Nota / Anexo (inalterado) */}
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

                    {/* Histórico de Notas (inalterado) */}
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