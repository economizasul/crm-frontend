// src/components/LeadEditModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'; // FaPlus removido
import axios from 'axios';
import { STAGES } from '../pages/KanbanBoard.jsx'; 
import { useAuth } from '../../AuthContext';

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
        
        // Compara campos simples
        const simpleFieldsChanged = Object.keys(leadData).some(key => {
            if (['notes', 'metadata', 'document', 'lat', 'lng', 'cidade', 'regiao', 'google_maps_link', 'qsa'].includes(key)) return false;
            
            // Lógica para valores numéricos, comparando com 0 se forem nulos na origem
            const leadValue = selectedLead[key] === null || selectedLead[key] === undefined ? 
                (typeof leadData[key] === 'number' ? 0 : '') : selectedLead[key];
                
            return String(leadValue) !== String(leadData[key]);
        });
        
        // Compara notas (simplesmente se o array mudou de tamanho ou se houve alteração nos textos)
        const currentNotesText = (leadData.notes || []).map(n => n.text).join('|');
        const originalNotesText = (selectedLead.notes || []).map(n => typeof n === 'string' ? n : n.text).join('|');
        
        const notesChanged = currentNotesText !== originalNotesText;
        
        return simpleFieldsChanged || notesChanged;
    }, [leadData, selectedLead]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/leads/users-for-reassignment`, {
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
            const leadIdentifier = selectedLead.id || selectedLead._id;

            const leadNotes = Array.isArray(selectedLead.notes)
                ? selectedLead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
                : (selectedLead.notes ? JSON.parse(selectedLead.notes).map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n) : []);

            // ✅ 1. Adicionado phone2 na sincronização do estado (useEffect)
            setLeadData({ 
                ...selectedLead, 
                reasonForLoss: selectedLead.reasonForLoss || '', 
                kwSold: selectedLead.kwSold || 0,
                sellerId: selectedLead.sellerId || null,
                sellerName: selectedLead.sellerName || '',
                metadata: selectedLead.metadata || {},
                avgConsumption: selectedLead.avgConsumption || 0,
                estimatedSavings: selectedLead.estimatedSavings || 0,
                phone2: selectedLead.phone2 || '', // 🟢 NOVO CAMPO
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
    
    // 🟢 2. NOVA FUNÇÃO: Lida com Enter e Shift+Enter no campo de notas
    const handleNoteKeyDown = (e) => {
        // Verifica se a tecla é Enter
        if (e.key === 'Enter') {
            // Se Shift estiver pressionado, permite o comportamento padrão (quebra de linha)
            if (e.shiftKey) {
                return;
            }
            // Se for apenas Enter, previne o comportamento padrão (quebra de linha)
            e.preventDefault();
            // Chama a função que adiciona a nota (simula o clique no botão)
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
            // Supondo que você tem um endpoint para upload e ele retorna a URL do arquivo
            const response = await axios.post(`${API_BASE_URL}/leads/upload-attachment`, formData, {
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
        
        // Remove campos que não devem ser enviados ou que são calculados
        const payload = { ...leadData };
        delete payload._id; 
        delete payload.owner_name;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.__v;
        
        // 1. O campo phone2 já está no payload porque ele foi incluído no leadData (pela spread operation)
        
        // Converte o array de notes para string JSON para salvar no banco
        payload.notes = JSON.stringify(payload.notes || []);

        try {
            await axios.put(`${API_BASE_URL}/leads/${leadData.id || leadData._id}`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Se houver mudança de fase para "Ganho", registra a data
            if (leadData.status === 'Ganho' && !selectedLead.date_won) {
                 await axios.put(`${API_BASE_URL}/leads/${leadData.id || leadData._id}`, { date_won: new Date().toISOString() }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }


            onSave(leadData); // Atualiza o estado no KanbanBoard
            fetchLeads(); // Força a busca para atualizar dados na tela principal
            onClose(); // Fecha o modal
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
            await axios.post(`${API_BASE_URL}/leads/reassign/${leadData.id || leadData._id}`, 
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
            setError(err.response?.data?.error || 'Erro ao transferir lead.');
        } finally {
            setIsTransferring(false);
        }
    };
    
    const getGoogleMapsLink = () => {
        if (!leadData.address) return null;
        const encodedAddress = encodeURIComponent(leadData.address);
        // Uso do formato correto do Google Maps para pesquisa
        return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    };

    const getWhatsAppLink = () => {
        // Importante: O botão WhatsApp continua usando APENAS o campo 'phone'
        if (!leadData.phone) return null;
        const normalizedPhone = leadData.phone.replace(/\D/g, ''); // Remove todos os não-dígitos
        return `https://api.whatsapp.com/send?phone=55${normalizedPhone}`; // Assumindo código do país 55 (Brasil)
    };

    if (!isModalOpen || !selectedLead) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Cabeçalho */}
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Editar Lead: {leadData.name || 'Sem Nome'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
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
                        <div className="mb-4 p-3 rounded-lg flex justify-between items-center text-sm font-semibold"
                            style={{ backgroundColor: STAGES[leadData.status]?.replace('100', '200') || '#f3f4f6', color: STAGES[leadData.status]?.replace('bg-', 'text-') || '#1f2937' }}>
                            <span>Fase Atual: {leadData.status}</span>
                            <span>ID: {leadData.id || leadData._id}</span>
                            <span>Proprietário: {leadData.sellerName || 'N/A'}</span>
                        </div>
                        
                        {/* Ações Rápidas */}
                        <div className="flex space-x-3 mb-4">
                            {leadData.address && (
                                <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" 
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                                    <FaMapMarkerAlt size={16} /> Abrir no Maps
                                </a>
                            )}
                            {leadData.phone && (
                                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" 
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                                    <FaWhatsapp size={16} /> Chamar no WhatsApp
                                </a>
                            )}
                        </div>

                        {/* Campos de Informação Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input type="text" name="name" className="w-full border rounded px-3 py-2" value={leadData.name || ''} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                <input type="email" name="email" className="w-full border rounded px-3 py-2" value={leadData.email || ''} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal</label>
                                <input type="tel" name="phone" className="w-full border rounded px-3 py-2" value={leadData.phone || ''} onChange={handleInputChange} />
                            </div>
                            {/* 🟢 1. NOVO CAMPO: Segundo Telefone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Telefone</label>
                                <input type="tel" name="phone2" className="w-full border rounded px-3 py-2" value={leadData.phone2 || ''} onChange={handleInputChange} />
                            </div>
                            {/* UC continua após o novo campo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">UC (Unidade Consumidora)</label>
                                <input type="text" name="uc" className="w-full border rounded px-3 py-2" value={leadData.uc || ''} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Número, Cidade, Estado)</label>
                            <input type="text" name="address" className="w-full border rounded px-3 py-2" value={leadData.address || ''} onChange={handleInputChange} />
                        </div>
                        
                        {/* Linha de 4 Colunas: Consumo, Economia, Status, Motivo da Perda */}
                        <div className="flex flex-wrap -mx-2 mb-4">
                            
                            {/* Consumo Médio (Kwh) - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consumo Médio (kWh)</label>
                                <input 
                                    type="number" 
                                    name="avgConsumption" 
                                    className="w-full border rounded px-3 py-2" 
                                    value={leadData.avgConsumption || ''} 
                                    onChange={handleInputChange} 
                                />
                            </div>

                            {/* Economia Estimada (R$) - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Economia Estimada (R$)</label>
                                <input 
                                    type="number" 
                                    name="estimatedSavings" 
                                    className="w-full border rounded px-3 py-2" 
                                    value={leadData.estimatedSavings || ''} 
                                    onChange={handleInputChange} 
                                />
                            </div>

                            {/* Status/Fase (Conta) - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fase (Conta) <span className="text-red-500">*</span></label>
                                <select
                                    name="status"
                                    className="w-full border rounded px-3 py-2 bg-white"
                                    value={leadData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {Object.keys(STAGES).map(stage => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Motivo da Perda - 25% */}
                            <div className="w-full md:w-1/4 px-2 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Perda</label>
                                <select
                                    name="reasonForLoss"
                                    className={`w-full border rounded px-3 py-2 ${
                                        leadData.status !== 'Perdido' 
                                            ? 'bg-gray-100 cursor-not-allowed' 
                                            : 'bg-white' 
                                    }`}
                                    value={leadData.reasonForLoss || ''}
                                    onChange={handleInputChange}
                                    disabled={leadData.status !== 'Perdido'}
                                    required={leadData.status === 'Perdido'} // Torna obrigatório se for 'Perdido'
                                >
                                    <option value="" disabled>
                                        {leadData.status !== 'Perdido' ? 'Desabilitado' : 'Selecione o motivo *'}
                                    </option>
                                    {LOSS_REASONS.map(reason => (
                                        <option key={reason} value={reason}>{reason}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações/QSA</label>
                            <textarea name="qsa" className="w-full border rounded px-3 py-2" rows="2" value={leadData.qsa || ''} onChange={handleInputChange}></textarea>
                        </div>
                        
                        {/* Transferência de Lead (Apenas para Admin) */}
                        {user.role === 'Admin' && users.length > 0 && (
                            <div className="mb-4 p-4 border rounded-lg bg-yellow-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-gray-800">Transferir Lead para:</label>
                                    <select
                                        name="newOwner"
                                        className="border rounded px-3 py-2 bg-white"
                                        value={newOwnerId}
                                        onChange={handleOwnerChange}
                                    >
                                        <option value="">Selecione um Proprietário</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={transferLead} 
                                    disabled={isTransferring || newOwnerId === leadData.owner_id}
                                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isTransferring ? 'Transferindo...' : 'Transferir'}
                                </button>
                            </div>
                        )}
                        
                    </form>

                    {/* Seção de Notas e Anexos */}
                    <h3 className="text-lg font-semibold border-b pb-2 mt-6 mb-4 text-gray-800">Histórico e Notas</h3>
                    
                    {/* Adicionar Nota */}
                    <div className="mb-4 border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Nova Nota:</label>
                        <div className="flex space-x-2 mb-2">
                            {/* 🟢 2. Adicionado onKeyDown para o handler de quebra de linha */}
                            <textarea 
                                className="w-full border rounded px-3 py-2" 
                                rows="2" 
                                value={newNoteText} 
                                onChange={(e) => setNewNoteText(e.target.value)} 
                                onKeyDown={handleNoteKeyDown}
                                placeholder="Digite sua anotação (Shift + Enter para quebra de linha)..."
                            ></textarea>
                            <button 
                                type="button" 
                                onClick={handleAddNote} 
                                disabled={newNoteText.trim() === ''}
                                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Adicionar
                            </button>
                        </div>
                        
                        {/* Anexo */}
                        <div className="flex items-center space-x-2 mt-2">
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                className="text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                            />
                            {selectedFile && (
                                <button 
                                    type="button" 
                                    onClick={handleAddAttachmentNote} 
                                    disabled={saving}
                                    className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaPaperclip size={16} /> 
                                    {saving ? 'Enviando...' : 'Anexar & Notar'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista de Notas */}
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-white">
                        <div className="space-y-3">
                            {leadData.notes && leadData.notes.length > 0 ? (
                                [...leadData.notes].reverse().map((note, index) => {
                                    const noteText = note.text;
                                    const noteTimestamp = note.timestamp || 0;
                                    const noteUser = note.user || 'Sistema';
                                    const isAttachment = note.isAttachment;
                                    
                                    // Determina a cor do cabeçalho da nota
                                    let headerBg = 'bg-gray-100';
                                    if (noteUser === 'Sistema') {
                                        headerBg = 'bg-indigo-50';
                                    } else if (isAttachment) {
                                        headerBg = 'bg-yellow-100';
                                    }
                                    
                                    return (
                                        <div key={index} className="p-3 border rounded-lg shadow-sm">
                                            <p className={`text-xs font-semibold ${headerBg} p-1 rounded inline-block mb-1`}>
                                                {formatNoteDate(noteTimestamp)} - {noteUser}
                                            </p>
                                            {/* O whitespace-pre-wrap garante que as quebras de linha (Shift+Enter) sejam exibidas */}
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

                {/* Footer / Botões de Ação */}
                <div className="mt-6 p-4 border-t flex justify-end space-x-2 sticky bottom-0 bg-white z-10">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700">Cancelar</button>
                    <button
                        type="button"
                        onClick={saveLeadChanges}
                        disabled={saving || !isDirty()} // Desabilita se não houver alterações
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