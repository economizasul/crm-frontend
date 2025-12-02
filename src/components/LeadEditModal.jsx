// src/components/LeadEditModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSave, FaPaperclip, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'; // FaPlus removido
import axios from 'axios';
import { STAGES } from '../KanbanBoard.jsx'; 
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
    
    const [leadData, setLeadData] = useState({ 
        ...selectedLead || {}, 
        reasonForLoss: selectedLead?.reasonForLoss || '', // 🟢 Estado inicializado
        kwSold: selectedLead?.kwSold || 0,
        sellerId: selectedLead?.sellerId || null,
        sellerName: selectedLead?.sellerName || '',
        metadata: selectedLead?.metadata || {},
    });
    const [newNoteText, setNewNoteText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    const [vendedores, setVendedores] = useState([]);
    const [novoDonoId, setNovoDonoId] = useState('');

    useEffect(() => {
        if (selectedLead && isModalOpen) {
            const leadIdentifier = selectedLead.id || selectedLead._id;

            const leadNotes = Array.isArray(selectedLead.notes)
                ? selectedLead.notes.map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n)
                : (selectedLead.notes ? JSON.parse(selectedLead.notes).map(n => typeof n === 'string' ? { text: n, timestamp: 0 } : n) : []);

            setLeadData({ 
                ...selectedLead, 
                reasonForLoss: selectedLead.reasonForLoss || '', // 🟢 Inicialização do motivo
                kwSold: selectedLead.kwSold || 0,
                sellerId: selectedLead.sellerId || null,
                sellerName: selectedLead.sellerName || '',
                metadata: selectedLead.metadata || {},
                avgConsumption: selectedLead.avgConsumption,
                estimatedSavings: selectedLead.estimatedSavings,
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
    }, [selectedLead, token, user, isModalOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeadData((prev) => {
            let finalValue = value;

            if (name === 'metadata') {
                try {
                    finalValue = JSON.parse(value);
                } catch (e) {
                    finalValue = value;
                }
            }

            const newData = { ...prev, [name]: finalValue };
            
            // 🟢 Lógica: Limpar motivo da perda se o status for alterado para diferente de 'Perdido'
            if (name === 'status' && value !== 'Perdido') {
                newData.reasonForLoss = ''; 
            }
            
            return newData;
        });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0] || null);
    };

    const transferirLead = async () => {
        if (!novoDonoId || novoDonoId === leadData.ownerId) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const leadIdentifier = selectedLead.id || selectedLead._id; 
            await axios.put(
                `${API_BASE_URL}/api/v1/leads/${leadIdentifier}`,
                { owner_id: novoDonoId },
                config
            );

            setLeadData(prev => ({ ...prev, ownerId: novoDonoId }));
            setNovoDonoId('');
            alert('Lead transferido com sucesso!');
            fetchLeads();
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            alert('Erro ao transferir lead: ' + msg);
        }
    };

    // FUNÇÃO DE SAVE DE LEADS
    const saveLeadChanges = async () => {
        if (!leadData || saving) return;

        setSaving(true);
        setApiError(null);
        
        // Validação: Motivo da Perda é obrigatório se o status for 'Perdido'
        if (leadData.status === 'Perdido' && !leadData.reasonForLoss) {
            setApiError("O Motivo de Perda é obrigatório para a fase 'Perdido'.");
            setSaving(false);
            return;
        }
        
        let metadataToSend = leadData.metadata;
        if (typeof metadataToSend === 'string') {
            try {
                metadataToSend = JSON.parse(metadataToSend);
            } catch(e) {
                setApiError("O campo Metadata contém um JSON inválido.");
                setSaving(false);
                return;
            }
        }

        // 1. Processar a nova nota e anexo em um único payload 'newNote' para o backend
        let newNotePayload = null;
        let finalNoteText = newNoteText.trim();
        
        if (selectedFile) {
            const fileNameNote = `[ANEXO REGISTRADO: ${selectedFile.name}]`;
            // Adiciona a nota de anexo, com um separador se já houver texto
            const separator = finalNoteText ? " | " : "";
            finalNoteText += separator + fileNameNote;
        }
        
        if(finalNoteText) {
            newNotePayload = { text: finalNoteText };
        }
        
        // 2. Cria o objeto dataToSend
        const dataToSend = {
            name: leadData.name,
            phone: leadData.phone,
            document: leadData.document,
            address: leadData.address,
            status: leadData.status,
            origin: leadData.origin,
            email: leadData.email,
            uc: leadData.uc,
            qsa: leadData.qsa || null,
            owner_id: leadData.ownerId, // Mapeado de ownerId (state) para owner_id (DB)
            avg_consumption: leadData.avgConsumption ? parseFloat(leadData.avgConsumption) : null,
            estimated_savings: leadData.estimatedSavings ? parseFloat(leadData.estimatedSavings) : null,
            // 🟢 Lógica de envio: Manda o valor se 'Perdido', senão manda null
            reason_for_loss: leadData.status === 'Perdido' ? (leadData.reasonForLoss || null) : null, 
            kw_sold: leadData.kwSold ? parseFloat(leadData.kwSold) : 0,
            seller_id: leadData.sellerId || null,
            seller_name: leadData.sellerName || null,
            metadata: metadataToSend,
            lat: leadData.lat || null, 
            lng: leadData.lng || null,
            newNote: newNotePayload, 
        };
        
        const leadIdentifier = selectedLead.id || selectedLead._id; 

        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            await axios.put(`${API_BASE_URL}/api/v1/leads/${leadIdentifier}`, dataToSend, config);

            setNewNoteText('');
            setSelectedFile(null);
            const fileInput = document.getElementById('attachment-input');
            if (fileInput) fileInput.value = '';

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
    
    // 🛠️ FIX 1: Adicionada a chave de fechamento '}' que estava faltando, corrigindo o erro de sintaxe em cascata.
    // 🛠️ FIX 2: Corrigida a URL de retorno e o template literal.
    const getGoogleMapsLink = () => {
        if (!leadData.address) return null;
        const encodedAddress = encodeURIComponent(leadData.address);
        return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }; 
    
    const getWhatsAppLink = () => {
        if (!leadData.phone) return null;
        const onlyNumbers = leadData.phone.replace(/[\D]/g, '');
        const formattedPhone = onlyNumbers.startsWith('55') ? onlyNumbers : `55${onlyNumbers}`;
        
        const initialMessage = `Olá, ${leadData.name || 'Lead'}, só para simplificar: Queremos que você pague menos na sua fatura da Copel, sem precisar de placas. Podemos fazer o cálculo exato da sua economia para os próximos meses?`;
        const encodedMessage = encodeURIComponent(initialMessage);

        // Protocolo WA WEB CORRIGIDO (usa web.whatsapp.com)
        return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    };


    if (!isModalOpen) return null;


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
                                Iniciar Conversa
                            </a>
                        )}
                    </div>
                    
                    {/* Linha 1: Nome, Email, Telefone, Documento */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome <span className="text-red-500">*</span></label><input type="text" name="name" className="w-full border rounded px-3 py-2" value={leadData.name || ''} onChange={handleInputChange} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" className="w-full border rounded px-3 py-2" value={leadData.email || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-red-500">*</span></label><input type="text" name="phone" className="w-full border rounded px-3 py-2" value={leadData.phone || ''} onChange={handleInputChange} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Documento</label><input type="text" name="document" className="w-full border rounded px-3 py-2" value={leadData.document || ''} onChange={handleInputChange} /></div>
                    </div>

                    {/* Linha 2: Endereço, UC, Origem */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label><input type="text" name="address" className="w-full border rounded px-3 py-2" value={leadData.address || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">UC</label><input type="text" name="uc" className="w-full border rounded px-3 py-2" value={leadData.uc || ''} onChange={handleInputChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Origem <span className="text-red-500">*</span></label><input type="text" name="origin" className="w-full border rounded px-3 py-2" value={leadData.origin || ''} onChange={handleInputChange} required /></div>
                    </div>

                    {/* ========================================================================= */}
                    {/* 🟢 LINHA REORGANIZADA (4 COLUNAS): Consumo, Economia, Status, Motivo da Perda */}
                    {/* ========================================================================= */}
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
                                {STAGES.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        </div>

                        {/* 🟢 NOVO CAMPO: Motivo da Perda - 25% */}
                        <div className="w-full md:w-1/4 px-2 mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Perda</label>
                            <select
                                name="reasonForLoss"
                                className={`w-full border rounded px-3 py-2 ${
                                    leadData.status !== 'Perdido' 
                                        ? 'bg-gray-100 cursor-not-allowed' 
                                        : 'bg-white border-red-500' // Destaca se estiver ativo e for importante
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
                    {/* ========================================================================= */}


                    {/* Linha 3: QSA (Observações) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">QSA (Quadro de Sócios e Administradores)</label>
                        <textarea name="qsa" className="w-full border rounded px-3 py-2" value={leadData.qsa || ''} onChange={handleInputChange}></textarea>
                    </div>

                    {/* Linha 4: KW Vendidos, Nome do Vendedor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KW Vendidos (kWp)</label>
                            <input 
                                type="number" 
                                name="kwSold" 
                                className="w-full border rounded px-3 py-2" 
                                value={leadData.kwSold || ''} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Vendedor</label>
                            <input 
                                type="text" 
                                name="sellerName" 
                                className="w-full border rounded px-3 py-2" 
                                value={leadData.sellerName || ''} 
                                onChange={handleInputChange} 
                            />
                        </div>
                    </div>

                    {/* Linha 5: Metadata, Lat, Lng */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metadata (JSON)</label>
                            <textarea 
                                name="metadata" 
                                rows={2} 
                                className="w-full border rounded px-3 py-2" 
                                value={typeof leadData.metadata === 'string' ? leadData.metadata : JSON.stringify(leadData.metadata, null, 2)} 
                                onChange={handleInputChange} 
                            />
                            {typeof leadData.metadata === 'string' && <p className="text-xs text-red-500 mt-1">⚠️ JSON Inválido ou em Edição</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input type="text" name="lat" className="w-full border rounded px-3 py-2" value={leadData.lat || ''} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input type="text" name="lng" className="w-full border rounded px-3 py-2" value={leadData.lng || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    
                    {/* TRANSFERÊNCIA DE LEAD */}
                    {user?.transferencia_leads && leadData.ownerId === user.id && (
                        <div className="mt-6 p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                            <h4 className="text-lg font-bold text-green-700 mb-3">Transferir Lead</h4>
                            <p className="text-sm text-gray-700 mb-3">Reatribua este lead para outro vendedor.</p>
                            <div className="flex space-x-3">
                                <select
                                    className="w-3/4 border rounded px-3 py-2"
                                    value={novoDonoId}
                                    onChange={(e) => setNovoDonoId(e.target.value)}
                                >
                                    <option value="">Selecione um Vendedor</option>
                                    {vendedores.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} ({v.email}) 
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={transferirLead}
                                    disabled={!novoDonoId}
                                    className="w-1/4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                >
                                    Transferir
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Adicionar Nova Nota/Anexo */}
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <label htmlFor="newNoteText" className="block text-sm font-bold text-indigo-800 mb-3 flex items-center space-x-2"><FaPaperclip size={16} /><span>Adicionar Novo Atendimento / Anexo</span></label>
                        <textarea
                            rows={3}
                            name="newNoteText"
                            className="w-full border rounded px-3 py-2 mb-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Descreva o atendimento ou a anotação aqui. Clique em 'Salvar Alterações' para registrar."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                        />
                        <input 
                            type="file" 
                            id="attachment-input"
                            onChange={handleFileChange} 
                            className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {selectedFile && <span className="ml-3 text-indigo-600 text-sm">Arquivo Selecionado: {selectedFile.name}</span>}
                    </div>

                    {/* Histórico de Notas */}
                    <div>
                        <h3 className="text-md font-bold text-gray-800 mb-2">Histórico de Notas ({leadData.notes?.length || 0})</h3>
                        <div className="max-h-40 overflow-y-auto border p-3 rounded-lg bg-white shadow-inner">
                            {Array.isArray(leadData.notes) && leadData.notes.length > 0 ? (
                                leadData.notes.slice().reverse().map((note, index) => {
                                    const noteTimestamp = note.timestamp || 0;
                                    const noteUser = note.user || 'Sistema';
                                    const noteText = note.text || '';
                                    const isAttachment = noteText.includes('[ANEXO REGISTRADO:');
                                    
                                    const noteClass = isAttachment
                                        ? "mb-2 p-2 border-l-4 border-yellow-500 bg-yellow-50 rounded text-sm"
                                        : "mb-2 p-2 border-b last:border-b-0 text-sm";
                                        
                                    return (
                                        <div key={index} className={noteClass}>
                                            <p className="font-semibold text-xs text-indigo-600">
                                                {formatNoteDate(noteTimestamp)} - {noteUser}
                                            </p>
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