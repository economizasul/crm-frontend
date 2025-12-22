// src/components/LeadEditModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { STAGES } from '../pages/KanbanBoard.jsx';
import { useAuth } from '../AuthContext.jsx';
import LeadService from '../services/LeadService.js';
import './styles/LeadEditModal.css';


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
        avgConsumption: selectedLead?.avgConsumption ?? selectedLead?.avg_consumption ?? '',
        estimatedSavings: selectedLead?.estimatedSavings ?? selectedLead?.estimated_savings ?? '', 
        ...selectedLead || {}, 
        reasonForLoss: selectedLead?.reasonForLoss || '', 
        kwSold: selectedLead?.kwSold || 0,

        phone2: selectedLead?.phone2 || '',
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
            'name','email','phone','phone2','document','address','status','origin',
            'owner_id','uc','avgConsumption','estimatedSavings','qsa',
            'lat','lng','cidade','regiao','google_maps_link','kwSold',
            'reasonForLoss','sellerId','sellerName'
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
            const data = await LeadService.getAssignableUsers(token);
            setUsers(data);
            if (leadData.owner_id) setNewOwnerId(leadData.owner_id);
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
                avgConsumption: selectedLead.avgConsumption ?? selectedLead.avg_consumption ?? '',
                estimatedSavings: selectedLead.estimatedSavings ?? selectedLead.estimated_savings ?? '',
                ...selectedLead, 
                reasonForLoss: selectedLead.reasonForLoss || '', 
                kwSold: selectedLead.kwSold || 0,
                sellerId: selectedLead.sellerId || null,
                sellerName: selectedLead.sellerName || '',
                metadata: selectedLead.metadata || {},
                phone2: selectedLead.phone2 || '',
                nextContactDate: selectedLead.nextContactDate 
                    ? new Date(selectedLead.nextContactDate).toISOString().split('T')[0] 
                    : '',
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

    const handleAddNote = async () => {
    if (!newNoteText.trim() || !leadData?.id) return;

    try {
        // 🔹 Chama o backend para salvar a nota
        await LeadService.addNote(leadData.id, newNoteText.trim(), token);

        // 🔹 Atualiza localmente a lista de notas (sem precisar recarregar)
        const newNote = {
        text: newNoteText.trim(),
        timestamp: Date.now(),
        user: user?.name || 'Usuário'
        };

        setLeadData(prev => ({
        ...prev,
        notes: [...(prev.notes || []), newNote]
        }));

        setNewNoteText('');
        setToast({ message: 'Nota adicionada com sucesso!', type: 'success' });
    } catch (err) {
        console.error('❌ Erro ao adicionar nota:', err);
        setToast({ message: 'Erro ao salvar nota', type: 'error' });
    }
    };

    
    const handleAddAttachmentNote = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setError(null);

    try {
        const { url } = await LeadService.uploadAttachment(
            leadData.id || leadData._id,
            selectedFile,
            user.name,
            token
        );

        const note = {
            text: `[ANEXO: ${selectedFile.name}] - URL: ${url}`,
            timestamp: Date.now(),
            user: user.name,
            isAttachment: true
        };

        setLeadData(prev => ({ ...prev, notes: [...(prev.notes || []), note] }));
        setSelectedFile(null);
        alert('Anexo enviado com sucesso e nota adicionada!');
    } catch (err) {
        console.error(err);
        setError('Erro ao enviar o anexo.');
    } finally {
        setSaving(false);
    }
    };

    const saveLeadChanges = async () => {
        if (saving || !isDirty()) return;
        if (leadData.status === 'Perdido' && !leadData.reasonForLoss) {
            setError('Motivo da perda é obrigatório.');
            return;
        }

        setSaving(true);
        setError(null);

        // 🔧 Prepara payload com todos os campos válidos
        const payload = { ...leadData };
        delete payload._id;
        delete payload.owner_name;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.__v;

        // Adiciona o campo de data
        if (leadData.nextContactDate !== undefined) {
            payload.next_contact_date = leadData.nextContactDate || null; // string YYYY-MM-DD ou null
        }

        // 🔧 Garante que notas e campos numéricos estejam no formato correto
        payload.notes = payload.notes || [];
        if (payload.avg_consumption) {
            payload.avg_consumption = Number(payload.avg_consumption);
        }
        if (payload.estimated_savings) {
            payload.estimated_savings = Number(payload.estimated_savings);
        }

        // garantir que o backend receba também snake_case (DB)
        if (payload.avgConsumption !== undefined) payload.avg_consumption = (payload.avgConsumption === '' ? null : Number(payload.avgConsumption));
        if (payload.estimatedSavings !== undefined) payload.estimated_savings = (payload.estimatedSavings === '' ? null : Number(payload.estimatedSavings));

        // opcional: garantir kw_sold em snake_case
        if (payload.kwSold !== undefined) payload.kw_sold = payload.kwSold ? Number(payload.kwSold) : 0;

        try {
            await LeadService.updateLead(leadData.id || leadData._id, payload, token);

            if (leadData.status === 'Ganho' && !selectedLead.date_won) {
                await LeadService.markLeadAsWon(leadData.id || leadData._id, token);
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
            await LeadService.transferLead(leadData.id || leadData._id, newOwnerId, token);
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
        if (!leadData.phone) return null;

        const phone = leadData.phone.replace(/\D/g, '');
        if (!phone) return null;

        const formatted = phone.startsWith('55') ? phone : `55${phone}`;

        const msg = encodeURIComponent(
            `Olá ${leadData.name || 'cliente'}, tudo bem? Sua fatura Copel é mais cara do que precisa ser. Temos a solução *SEM PLACAS* e *SEM CUSTO* que corrige isso. Quer um diagnóstico sem compromisso e rápido da sua economia *GARANTIDA*?`
        );

        // Abre no WhatsApp Web (desktop) ou app (mobile)
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
                    <h2 className="text-2xl font-bold text-gray-600 dark:text-white">
                        Editar Lead: {leadData.name || 'Sem Nome'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
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
                        
                                                {/* ←←← NOVA ORGANIZAÇÃO: UC | Consumo Médio | Economia Estimada | Origem */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">UC</label>
                                <input type="text" name="uc" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.uc || ''} onChange={handleInputChange} />
                            </div>
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Consumo Médio (kWh)</label>
                                <input
                                    type="number"
                                    name="avgConsumption"
                                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={leadData.avgConsumption ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Economia Estimada (R$)</label>
                                <input
                                    type="number"
                                    name="estimatedSavings"
                                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={leadData.estimatedSavings ?? ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Origem</label>
                                <input type="text" name="origin" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={leadData.origin || ''} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* ←←← QSA em linha própria com mais espaço */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-3/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">QSA</label>
                                <textarea
                                    name="qsa"
                                    rows="3"
                                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                                    value={leadData.qsa || ''}
                                    onChange={handleInputChange}
                                    placeholder="Detalhes adicionais, observações, etc."
                                />
                            </div>
                        </div>

                        {/* ←←← LINHA FINAL: Fase | Motivo da Perda (condicional) | (espaço) | Data do próximo contato (direita) */}
                        <div className="flex flex-wrap -mx-2 mb-4">
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

                            {/* Motivo da Perda - condicional (aparece só se Perdido) */}
                            {leadData.status === 'Perdido' && renderConditionalFields()}

                            {/* KW Vendido - condicional para Ganho (já tratado dentro de renderConditionalFields) */}
                            {leadData.status === 'Ganho' && renderConditionalFields()}

                            {/* Espaço vazio para alinhar quando não há condicional */}
                            {(leadData.status !== 'Perdido' && leadData.status !== 'Ganho') && (
                                <div className="w-full md:w-1/4 px-2 mb-4"></div>
                            )}

                            {/* Data do próximo contato - sempre à direita */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                    Data do próximo contato
                                </label>
                                <input
                                    type="date"
                                    name="nextContactDate"
                                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={leadData.nextContactDate || ''}
                                    onChange={handleInputChange}
                                />
                                <p className="text-xs text-gray-500 mt-1">Deixe vazio para remover</p>
                            </div>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Adicionar Nova Nota:
                            </label>
                            <div className="flex space-x-3 mb-4">
                                <textarea
                                    className="flex-1 border rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                                        const noteTimestamp = note.timestamp ||  note.timestamp || 0;
                                        const noteUser = note.user || 'Sistema';
                                        const isAttachment = note.isAttachment || noteText.includes('[ANEXO:');

                                        return (
                                            <div
                                                key={index}
                                                className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow"
                                            >
                                                {/* Cabeçalho: data + usuário → um tom acima do fundo */}
                                                <div
                                                    className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-3 border
                                                        ${isAttachment 
                                                            ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' 
                                                            : 'bg-gray-700 text-gray-300 border-gray-600'
                                                        }`}
                                                >
                                                    {formatNoteDate(noteTimestamp)} - {noteUser}
                                                </div>

                                                {/* Texto da nota → branco puro no dark mode */}
                                                <p className={`whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-400
                                                    ${isAttachment ? 'text-yellow-300 font-medium' : ''}
                                                `}>
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