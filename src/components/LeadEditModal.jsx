// src/components/LeadEditModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'; // FaPlus removido
import axios from 'axios';
import { STAGES } from '../pages/KanbanBoard.jsx'; // 🟢 CORRIGIDO: Adicionado /pages/
import { useAuth } from '../AuthContext.jsx';

// Motivos de Perda
const LOSS_REASONS = [
    'Oferta Melhor', 'Incerteza', 'Geração Própria', 'Burocracia', 'Contrato',
    'Restrições Técnicas', 'Não é o Responsavel', 'Silêncio', 'Já Possui GD',
    'Outro Estado'
];

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
    
    // ✅ 1. Adicionado phone2 na inicialização do estado (useState)
    const [leadData, setLeadData] = useState({ 
        ...selectedLead || {}, 
        reasonForLoss: selectedLead?.reasonForLoss || '', 
        kwSold: selectedLead?.kwSold || 0,
        avgConsumption: selectedLead?.avgConsumption || 0,
        estimatedSavings: selectedLead?.estimatedSavings || 0,
        phone2: selectedLead?.phone2 || '', // 🟢 NOVO CAMPO
    });
    
    const [newNoteText, setNewNoteText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isTransferring, setIsTransferring] = useState(false);
    const [users, setUsers] = useState([]);
    const [newOwnerId, setNewOwnerId] = useState('');

    const isDirty = useCallback(() => {
        if (!selectedLead) return false;
        
        // Campos editáveis que devem ser comparados.
        const editableFields = [
            'name', 'email', 'phone', 'phone2', 'document', 'address', 'status', 'origin', 
            'owner_id', 'uc', 'avgConsumption', 'estimatedSavings', 'qsa', 
            'lat', 'lng', 'cidade', 'regiao', 'google_maps_link', 'kwSold', 
            'reasonForLoss', 'sellerId', 'sellerName'
        ];
        
        // 🔴 Otimização: Comparação de campos simples de forma mais concisa
        const simpleFieldsChanged = editableFields.some(field => {
            // Garante que null/undefined se tornem strings vazias para comparação consistente
            const leadValue = String(leadData[field] ?? '');
            const originalValue = String(selectedLead[field] ?? '');

            // Compara o valor do formulário com o valor original
            return leadValue.trim() !== originalValue.trim();
        });
        
        // Compara notas (verifica se o array de notas foi alterado)
        const currentNotesText = (leadData.notes || []).map(n => n.text).join('|');
        const originalNotesText = (selectedLead.notes || []).map(n => typeof n === 'string' ? n : n.text).join('|');
        
        const notesChanged = currentNotesText !== originalNotesText;
        
        return simpleFieldsChanged || notesChanged;
    }, [leadData, selectedLead]);

    const fetchUsers = useCallback(async () => {
        try {
            // ❌ CORREÇÃO 404: Adicionado /v1/ e corrigido o endpoint para users/reassignment
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads/users/reassignment`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers(response.data);
            if (leadData.owner_id) {
                setNewOwnerId(leadData.owner_id);
            }
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            setError('Erro ao buscar usuários para transferência.');
        }
    }, [token, leadData.owner_id]);

    useEffect(() => {
        if (selectedLead && isModalOpen) {
            // Normalização das notas
            const leadNotes = Array.isArray(selectedLead.notes)
                ? selectedLead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
                : (selectedLead.notes ? JSON.parse(selectedLead.notes).map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n) : []);

            setLeadData({ 
                ...selectedLead, 
                reasonForLoss: selectedLead.reasonForLoss || '', 
                kwSold: selectedLead.kwSold || 0,
                sellerId: selectedLead.sellerId || null,
                sellerName: selectedLead.sellerName || '',
                metadata: selectedLead.metadata || {},
                avgConsumption: selectedLead.avgConsumption || 0,
                estimatedSavings: selectedLead.estimatedSavings || 0,
                phone2: selectedLead.phone2 || '',
                notes: leadNotes 
            });
            
            setError(null);
            setNewNoteText('');
            setSelectedFile(null);
            
            if (user.role === 'Admin') {
                fetchUsers();
            }
        }
    }, [selectedLead, token, user, isModalOpen, fetchUsers]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData(prev => ({ ...prev, [name]: value }));
    };

    const handleOwnerChange = (e) => {
        setNewOwnerId(e.target.value);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    
    // Lida com Enter e Shift+Enter no campo de notas
    const handleNoteKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    const handleAddNote = () => {
        if (newNoteText.trim() === '') return;
        
        const note = {
            text: newNoteText.trim(),
            timestamp: Date.now(),
            user: user.name || 'Usuário Desconhecido'
        };

        setLeadData(prev => ({
            ...prev,
            notes: [...(prev.notes || []), note] 
        }));
        setNewNoteText('');
    };
    
    const handleAddAttachmentNote = async () => {
        if (!selectedFile) return;

        setSaving(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('leadId', leadData.id || leadData._id);
        formData.append('user', user.name || 'Usuário Desconhecido');

        try {
            // ❌ CORREÇÃO 404: Adicionado /v1/
            const response = await axios.post(`${API_BASE_URL}/api/v1/leads/upload-attachment`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const fileUrl = response.data.url; 
            const fileName = selectedFile.name;

            const note = {
                text: `[ANEXO: ${fileName}] - URL: ${fileUrl}`,
                timestamp: Date.now(),
                user: user.name || 'Usuário Desconhecido',
                isAttachment: true
            };

            setLeadData(prev => ({
                ...prev,
                notes: [...(prev.notes || []), note]
            }));
            
            setSelectedFile(null);
            alert('Anexo enviado com sucesso e nota adicionada!');

        } catch (err) {
            console.error('Erro ao enviar anexo:', err);
            setError('Erro ao enviar o anexo. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };
    
    const saveLeadChanges = async () => {
        if (saving || !isDirty()) return;

        // Validação condicional para 'Motivo da Perda'
        if (leadData.status === 'Perdido' && !leadData.reasonForLoss) {
            setError('O Motivo da Perda é obrigatório quando a fase é "Perdido".');
            return;
        }

        setSaving(true);
        setError(null);
        
        const payload = { ...leadData };
        // Campos que NÃO devem ser enviados
        delete payload._id; 
        delete payload.owner_name;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.__v;
        
        // Converte o array de notes para string JSON para salvar no banco
        payload.notes = JSON.stringify(payload.notes || []);

        try {
            // ❌ CORREÇÃO 404: Adicionado /v1/
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData.id || leadData._id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Se houver mudança de fase para "Ganho", registra a data
            if (leadData.status === 'Ganho' && !selectedLead.date_won) {
                 // ❌ CORREÇÃO 404: Adicionado /v1/
                 await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData.id || leadData._id}`, { date_won: new Date().toISOString() }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            onSave(leadData);
            fetchLeads();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar lead:', err);
            setError(err.response?.data?.error || 'Erro ao salvar alterações.');
        } finally {
            setSaving(false);
        }
    };
    
    const transferLead = async () => {
        if (!newOwnerId) return;
        setIsTransferring(true);
        setError(null);

        try {
            // ❌ CORREÇÃO 404: Adicionado /api/v1/ e garantido que é PUT
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadData.id || leadData._id}/reassign`, 
                { newOwnerId }, 
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            alert('Lead transferido com sucesso!');
            fetchLeads();
            onClose();
        } catch (err) {
            console.error('Erro ao transferir lead:', err);
            setError(err.response?.data?.error || 'Erro ao transferir o lead.');
        } finally {
            setIsTransferring(false);
        }
    };


    const getGoogleMapsLink = () => {
        if (leadData.google_maps_link) return leadData.google_maps_link;
        if (leadData.address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(leadData.address)}`;
        return '#';
    };

    const getWhatsAppLink = () => {
    if (!formData.phone) return null;

    const phone = formData.phone.replace(/\D/g, '');
    const formatted = phone.startsWith('55') ? phone : `55${phone}`;

    const msg = encodeURIComponent(
        `Olá ${formData.name}, Tudo bem? Estou entrando só para simplificar: Queremos que você pague menos na sua fatura da Copel, sem precisar de placas. Podemos fazer o cálculo exato da sua economia para os próximos meses?`
    );

    // Força abrir no WhatsApp Web no desktop, e no app no celular
    const base = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent)
        ? 'https://api.whatsapp.com/send'
        : 'https://web.whatsapp.com/send';

    return `${base}?phone=${formatted}&text=${msg}`;
    };


    if (!isModalOpen) return null;

    // Função para renderizar os campos de KW e Motivo de Perda
    const renderConditionalFields = () => {
        if (leadData.status === 'Ganho') {
            return (
                <div className="w-full md:w-1/4 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">KW Vendido</label>
                    <input type="number" name="kwSold" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.kwSold || ''} onChange={handleInputChange} />
                </div>
            );
        }
        if (leadData.status === 'Perdido') {
            return (
                <div className="w-full md:w-1/4 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Motivo da Perda <span className="text-red-500">*</span></label>
                    <select 
                        name="reasonForLoss" 
                        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        value={leadData.reasonForLoss} 
                        onChange={handleInputChange} 
                        required={leadData.status === 'Perdido'}
                    >
                        <option value="">Selecione...</option>
                        {LOSS_REASONS.map(reason => (
                            <option key={reason} value={reason}>{reason}</option>
                        ))}
                    </select>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all my-8 dark:bg-gray-900 flex flex-col max-h-[90vh]">
                
                {/* Header do Modal */}
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 dark:bg-gray-900 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Editar Lead: {leadData.name || 'Sem Nome'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 overflow-y-auto flex-grow">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Erro:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); saveLeadChanges(); }}>
                        {/* Status Bar */}
                        <div 
                            className="mb-4 p-3 rounded-lg flex justify-between items-center text-sm font-semibold" 
                            style={{ 
                                backgroundColor: STAGES[leadData.status]?.replace('100', '200') || '#f3f4f6', 
                                color: STAGES[leadData.status]?.replace('bg-', 'text-') || '#1f2937' 
                            }}
                        >
                            <span>Fase Atual: {leadData.status}</span>
                            <span>ID: {leadData.id || leadData._id}</span>
                            <span>Proprietário: {leadData.sellerName || 'N/A'}</span>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="flex space-x-3 mb-4">
                            {leadData.address && (
                                <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                                    <FaMapMarkerAlt size={16} /> Abrir no Maps
                                </a>
                            )}
                            {leadData.phone && (
                                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                                    <FaWhatsapp size={16} /> Chamar no WhatsApp
                                </a>
                            )}
                        </div>

                        {/* Linha 1: Nome e Email */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nome <span className="text-red-500">*</span></label>
                                <input type="text" name="name" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
                                <input type="email" name="email" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.email || ''} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* Linha 2: Telefone 1 e Telefone 2 */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Telefone <span className="text-red-500">*</span></label>
                                <input type="text" name="phone" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.phone || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Telefone 2</label>
                                <input type="text" name="phone2" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.phone2 || ''} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* Linha 3: Endereço e Cidade/Região */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Endereço</label>
                                <input type="text" name="address" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.address || ''} onChange={handleInputChange} />
                            </div>
                            <div className="w-full md:w-1/2 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Cidade/Região</label>
                                <input type="text" name="cidade" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.cidade || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                        
                        {/* Linha 4: UC, QSA e Origem */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-1/3 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">UC</label>
                                <input type="text" name="uc" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.uc || ''} onChange={handleInputChange} />
                            </div>
                            <div className="w-full md:w-1/3 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">QSA</label>
                                <input type="text" name="qsa" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.qsa || ''} onChange={handleInputChange} />
                            </div>
                            <div className="w-full md:w-1/3 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Origem</label>
                                <input type="text" name="origin" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.origin || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                        
                        {/* Linha de 4 Colunas: Consumo, Economia, Status, KW/Motivo */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            {/* Consumo Médio (Kwh) - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Consumo Médio (kWh)</label>
                                <input type="number" name="avgConsumption" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.avgConsumption || ''} onChange={handleInputChange} />
                            </div>
                            {/* Economia Estimada (R$) - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Economia Estimada (R$)</label>
                                <input type="number" name="estimatedSavings" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.estimatedSavings || ''} onChange={handleInputChange} />
                            </div>
                            {/* Status/Fase (Conta) - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Fase (Conta) <span className="text-red-500">*</span></label>
                                <select 
                                    name="status" 
                                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                    value={leadData.status} 
                                    onChange={handleInputChange} 
                                    required 
                                >
                                    {Object.keys(STAGES).map(stage => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </div>
                            {/* KW Vendido / Motivo da Perda (Condicional) - 25% */}
                            {renderConditionalFields()}
                        </div>

                        {/* Transferência (Somente Admin) */}
                        {user.role === 'Admin' && (
                            <div className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Transferir Lead:</label>
                                <div className="flex space-x-2">
                                    <select 
                                        name="newOwnerId" 
                                        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                        value={newOwnerId} 
                                        onChange={handleOwnerChange}
                                        disabled={isTransferring}
                                    >
                                        <option value="">Selecione Novo Proprietário...</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    <button 
                                        type="button" 
                                        onClick={transferLead}
                                        disabled={!newOwnerId || isTransferring}
                                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isTransferring ? 'Transferindo...' : 'Transferir'}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                    </form>

                    {/* Área de Anotações */}
                    <div className="mt-6">

                        {/* Nova Nota / Anexo */}
                        <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
                                Adicionar Nova Nota:
                            </label>
                            <div className="flex space-x-3 mb-4">
                                <textarea
                                    className="flex-1 border rounded-lg px-4 py-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    rows="3"
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    onKeyDown={handleNoteKeyDown}
                                    placeholder="Digite sua anotação (Shift + Enter para quebra de linha)..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddNote}
                                    disabled={newNoteText.trim() === ''}
                                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    Adicionar
                                </button>
                            </div>

                            {/* Anexo */}
                            <div className="flex items-center space-x-3 border-t border-gray-300 dark:border-gray-600 pt-4">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-gray-700 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddAttachmentNote}
                                    disabled={!selectedFile || saving}
                                    className="px-5 py-2.5 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2 transition"
                                >
                                    <FaPaperclip size={16} />
                                    <span>{saving ? 'Enviando...' : 'Anexar e Adicionar Nota'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Lista de Notas */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5 pb-2 border-b border-gray-200 dark:border-gray-700">
                                Histórico de Anotações
                            </h3>

                            {leadData.notes && leadData.notes.length > 0 ? (
                                <div className="space-y-4">
                                    {[...leadData.notes].reverse().map((note, index) => {
                                        const noteText = note.text || note;
                                        const noteTimestamp = note.timestamp || 0;
                                        const noteUser = note.user || 'Sistema';
                                        const isAttachment = note.isAttachment || noteText.includes('[ANEXO:');

                                        return (
                                            <div
                                                key={index}
                                                className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                {/* Cabeçalho: data + usuário */}
                                                <div
                                                    className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-3
                                                        ${isAttachment 
                                                            ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-300' 
                                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {formatNoteDate(noteTimestamp)} - {noteUser}
                                                </div>

                                                {/* Texto da nota */}
                                                <p
                                                    className={`whitespace-pre-wrap leading-relaxed
                                                        ${isAttachment 
                                                            ? 'text-yellow-800 dark:text-yellow-400 font-medium' 
                                                            : 'text-gray-800 dark:text-gray-200'
                                                        }`}
                                                >
                                                    {noteText}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 italic py-8">
                                    Nenhuma nota registrada.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Botões de Ação */}
                <div className="mt-8 p-4 border-t flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={saveLeadChanges}
                        disabled={saving || !isDirty()}
                        className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2 transition shadow-lg"
                    >
                        <FaSave size={18} />
                        <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadEditModal;