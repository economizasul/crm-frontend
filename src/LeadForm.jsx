// src/LeadForm.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { X, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Componente simples de Toast para feedback ao usuário (Mantido)
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    return (
        <div className={`p-3 rounded-lg text-white font-medium shadow-lg fixed top-4 right-4 z-50 ${bgColor}`}>
            {message}
        </div>
    );
};

// Definição estática das fases do Kanban para o select (Mantida)
const STAGES = [
    'Novo',
    'Para Contatar',
    'Em Negociação',
    'Proposta Enviada',
    'Ganho',
    'Perdido',
    'Retorno Agendado',
];

const LeadForm = () => {
    const { id } = useParams();
    const isEditMode = !!id; 
    
    const [initialLead, setInitialLead] = useState(null); 
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', document: '', address: '', 
        status: 'Novo', origin: '', uc: '', qsa: '', 
        avgConsumption: '', estimatedSavings: '', notes: [],
        assignedToId: '', // Campo para transferência
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]); 
    
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();
    const isAdmin = user?.role === 'Admin';


    const showToast = useCallback((message, type) => {
        setToast({ message, type });
        setError(null);
    }, []);

    // 1. Busca lista de usuários para reatribuição (Admin Only) (Mantida)
    const fetchUsers = useCallback(async () => {
        if (!isAdmin || !token) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads/users/reassignment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error("Erro ao buscar usuários:", err.response?.data || err.message);
        }
    }, [isAdmin, token]);
    
    // 2. Busca dados do Lead (Modo Edição) (Mantida)
    const fetchLeadData = useCallback(async () => {
        if (!id || !token) return;

        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const leadData = response.data;
            
            const mappedData = {
                ...leadData,
                avgConsumption: leadData.avgConsumption ?? '',
                estimatedSavings: leadData.estimatedSavings ?? '',
                
                // Mapeia o proprietário atual para o campo de reatribuição
                assignedToId: leadData.ownerId, 
                
                notes: Array.isArray(leadData.notes) ? leadData.notes : [],
            };

            setFormData(mappedData);
            setInitialLead(mappedData); 
            
        } catch (err) {
            console.error("Erro ao buscar lead:", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Falha ao carregar dados do lead.');
            if (err.response?.status === 403) {
                navigate('/leads'); 
            } else if (err.response?.status === 401) {
                logout(); 
            }
        } finally {
            setLoading(false);
        }
    }, [id, token, navigate, logout]);
    
    useEffect(() => {
        if (isEditMode) {
            fetchLeadData();
        }
        fetchUsers();
    }, [isEditMode, fetchLeadData, fetchUsers]);

    // Função de mudança de input (Mantida)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Submissão do Formulário (Criação ou Edição)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setToast(null);

        if (!formData.name || !formData.phone || !formData.status || !formData.origin) {
            setError('Nome, Telefone, Status e Origem são obrigatórios.');
            setLoading(false);
            return;
        }
        
        // 💡 CRÍTICO: Determina o ID para transferência
        let transferId = undefined;
        // Se estiver em modo edição, for Admin, e o ID de reatribuição for diferente do original
        if (isEditMode && isAdmin && initialLead && String(formData.assignedToId) !== String(initialLead.ownerId)) {
            transferId = formData.assignedToId;
        }

        const dataToSend = {
            ...formData,
            // Sanitização de numéricos (Mantida)
            avgConsumption: formData.avgConsumption === '' || formData.avgConsumption === null ? null : parseFloat(formData.avgConsumption),
            estimatedSavings: formData.estimatedSavings === '' || formData.estimatedSavings === null ? null : parseFloat(formData.estimatedSavings),
            
            // Envia o ID de transferência *SOMENTE* se houver uma alteração de proprietário
            ...(transferId && { assignedToId: transferId }),
            
            // Remove ownerId e ownerName para evitar conflito com o assignedToId / nova logica do Controller
            ownerId: undefined, 
            ownerName: undefined,
            
            // Adiciona nota se for um novo lead (Mantida)
            notes: isEditMode 
                   ? formData.notes 
                   : [{ text: `Lead criado (Origem: ${formData.origin})`, timestamp: Date.now() }],
        };
        
        // Remove assignedToId do objeto se não for para enviar (redundância de segurança)
        if (!transferId) {
            delete dataToSend.assignedToId;
        }


        const method = isEditMode ? 'put' : 'post';
        const url = isEditMode 
            ? `${API_BASE_URL}/api/v1/leads/${id}` 
            : `${API_BASE_URL}/api/v1/leads`;

        try {
            const response = await axios[method](url, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            showToast(`Lead ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
            
            if (!isEditMode) {
                navigate(`/register-lead/${response.data._id}`, { replace: true });
            }

        } catch (err) {
            console.error("Erro na submissão do lead:", err.response?.data || err.message);
            setError(err.response?.data?.error || `Falha ao ${isEditMode ? 'atualizar' : 'cadastrar'} lead.`);
        } finally {
            setLoading(false);
        }
    };

    // Renderização simplificada (Mantida)
    if (loading && isEditMode && !initialLead) {
        return <div className="p-6 text-center text-indigo-600">Carregando lead...</div>;
    }
    
    const pageTitle = isEditMode ? 'Editar Lead Existente' : 'Cadastrar Novo Lead';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Cabeçalho (Mantido) */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
                <button 
                    onClick={() => navigate('/leads')}
                    className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Voltar à Lista</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl">
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Grid de Campos Principais (Mantido) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Nome (Obrigatório) */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo <span className="text-red-500">*</span></label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Telefone (Obrigatório) */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
                        <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* Documento (CPF/CNPJ) */}
                    <div>
                        <label htmlFor="document" className="block text-sm font-medium text-gray-700">Documento (CPF/CNPJ)</label>
                        <input type="text" id="document" name="document" value={formData.document} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* Status e Origem (Mantido) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Status (Obrigatório) */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>

                    {/* Origem (Obrigatório) */}
                    <div>
                        <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origem <span className="text-red-500">*</span></label>
                        <input type="text" id="origin" name="origin" value={formData.origin} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* Transferência (Admin Only - Mantido) */}
                {isEditMode && isAdmin && users.length > 0 && (
                    <div className="mb-6 border-2 border-indigo-200 p-4 rounded-lg bg-indigo-50">
                        <h3 className="text-lg font-bold text-indigo-700 mb-3">Transferência de Lead</h3>
                        <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">Reatribuir a</label>
                        <select
                            id="assignedToId"
                            name="assignedToId"
                            value={formData.assignedToId}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-indigo-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value={initialLead?.ownerId || ''} disabled>Selecione um Vendedor</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.role}) {u.id === initialLead?.ownerId ? ' - Proprietário Atual' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}


                {/* Campos de Consumo e Economia (Mantido) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* UC */}
                    <div>
                        <label htmlFor="uc" className="block text-sm font-medium text-gray-700">UC (Unidade Consumidora)</label>
                        <input type="text" id="uc" name="uc" value={formData.uc} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" />
                    </div>

                    {/* Consumo Médio (Numérico) */}
                    <div>
                        <label htmlFor="avgConsumption" className="block text-sm font-medium text-gray-700">Consumo Médio (kW/h)</label>
                        <input type="number" step="0.01" id="avgConsumption" name="avgConsumption" value={formData.avgConsumption} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" placeholder="0.00" />
                    </div>

                    {/* Economia Estimada (Numérico) */}
                    <div>
                        <label htmlFor="estimatedSavings" className="block text-sm font-medium text-gray-700">Economia Estimada (R$)</label>
                        <input type="number" step="0.01" id="estimatedSavings" name="estimatedSavings" value={formData.estimatedSavings} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" placeholder="0.00" />
                    </div>
                </div>

                {/* Endereço e QSA (Mantido) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Endereço */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" />
                    </div>
                    {/* QSA */}
                    <div>
                        <label htmlFor="qsa" className="block text-sm font-medium text-gray-700">QSA (Quadro de Sócios)</label>
                        <input type="text" id="qsa" name="qsa" value={formData.qsa} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" />
                    </div>
                </div>

                {/* Botão de Submissão (Mantido) */}
                <button 
                    type="submit"
                    disabled={loading || !formData.name || !formData.phone}
                    className="w-full flex justify-center items-center space-x-2 px-6 py-3 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>{isEditMode ? 'Salvar Alterações' : 'Cadastrar Lead'}</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default LeadForm;