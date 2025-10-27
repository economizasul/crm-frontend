import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { X, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // 💡 INCLUSÃO: useParams para edição
import { useAuth } from './AuthContext.jsx'; 

// 🛑 CORREÇÃO CRÍTICA: Usa a variável de ambiente VITE_API_URL configurada no Render
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Componente simples de Toast para feedback ao usuário
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Fecha automaticamente após 3 segundos
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    return (
        <div className={`p-3 rounded-lg text-white font-medium shadow-lg fixed top-4 right-4 z-50 ${bgColor}`}>
            {message}
        </div>
    );
};

// Definição estática das fases do Kanban para o select
const STAGES = [
    'Para Contatar', 'Em Conversação', 'Proposta Enviada', 'Fechado', 'Perdido'
];


function LeadForm() {
    // 💡 NOVO: Pega o ID da URL para modo de Edição (Se o componente for usado em uma rota como /lead/edit/:id)
    const { id: leadId } = useParams(); 
    
    // Pega o token E A ROLE do usuário logado
    const { token, user } = useAuth(); 
    const navigate = useNavigate();
    
    // 💡 Variáveis de estado adicionadas
    const isEditMode = !!leadId;
    const isAdmin = user && (user.role === 'Admin' || user.role === 'admin');
    const [users, setUsers] = useState([]); // Lista de usuários para transferência
    const [assignedToId, setAssignedToId] = useState(''); // ID do proprietário atual/novo
    
    // Estado do Formulário
    const [formData, setFormData] = useState({
        name: '', phone: '', document: '', address: '',
        status: STAGES[0], origin: '', email: '', uc: '',
        avgConsumption: '', estimatedSavings: '', qsa: '', notes: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBack = () => {
        navigate('/dashboard', { replace: true });
    };
    
    // 💡 useEffect: Carregar dados do lead (Edição) e lista de usuários (Admin)
    useEffect(() => {
        // 1. Carregar lista de usuários (apenas para Admin)
        const fetchUsers = async () => {
            if (isAdmin) {
                 try {
                    const response = await axios.get(`${API_BASE_URL}/api/v1/leads/users/reassignment`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUsers(response.data);
                } catch (error) {
                    console.error("Erro ao carregar usuários:", error);
                }
            }
        };

        // 2. Carregar dados do lead (se estiver em edição)
        const fetchLeadData = async () => {
            if (isEditMode) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/v1/leads/${leadId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const leadData = response.data;
                    
                    // Converte o array de objetos notas (formatado pelo controller) para string de texto
                    const notesString = leadData.notes.map(n => n.text).join('\n');
                    
                    // Preenche o formulário
                    setFormData({
                        name: leadData.name, phone: leadData.phone, document: leadData.document || '',
                        address: leadData.address || '', status: leadData.status, origin: leadData.origin,
                        email: leadData.email || '', uc: leadData.uc || '', qsa: leadData.qsa || '',
                        avgConsumption: leadData.avgConsumption || '', estimatedSavings: leadData.estimatedSavings || '',
                        notes: notesString,
                    });
                    
                    // Seta o proprietário atual para o campo de transferência
                    setAssignedToId(leadData.ownerId); 

                } catch (error) {
                    console.error("Erro ao carregar dados do lead:", error);
                    setToastMessage({ message: 'Erro ao carregar dados do lead.', type: 'error' });
                }
            }
        };

        fetchUsers();
        fetchLeadData();

    }, [leadId, token, isAdmin, isEditMode]); // Dependências do useEffect
    
    
    // Lógica de Submissão
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToastMessage(null); // Limpa mensagens anteriores

        // Prepara as notas em formato de Array de Objetos para que o backend stringifique corretamente
        const notesArrayOfObjects = formData.notes.split('\n').map(n => n.trim()).filter(n => n.length > 0)
                                    .map(text => ({ text, timestamp: new Date().getTime() }));
        
        const dataToSend = {
            ...formData,
            // Certifica-se que consumo e economia são números ou nulos
            avgConsumption: formData.avgConsumption ? parseFloat(formData.avgConsumption) : null,
            estimatedSavings: formData.estimatedSavings ? parseFloat(formData.estimatedSavings) : null,
            // 💡 CRÍTICO: Stringifica o array de objetos notas para a coluna TEXT do DB
            notes: JSON.stringify(notesArrayOfObjects), 
        };
        
        // 💡 LÓGICA DE TRANSFERÊNCIA NO PAYLOAD (só inclui se for Admin)
        if (isAdmin && assignedToId) {
            dataToSend.assignedToId = assignedToId; // O controller irá usar este campo para atualizar o ownerId
        }

        // Remove campos vazios ou irrelevantes para evitar problemas
        Object.keys(dataToSend).forEach(key => {
            if (dataToSend[key] === '' || dataToSend[key] === null) {
                delete dataToSend[key];
            }
        });
        
        // ... (Verifica se o token existe)
        if (!token) {
            setLoading(false);
            setToastMessage({ message: 'Erro de autenticação. Faça login novamente.', type: 'error' });
            navigate('/login');
            return;
        }

        // Define a URL e o Método (POST para Criação, PUT para Edição)
        const method = isEditMode ? axios.put : axios.post;
        const url = isEditMode ? `${API_BASE_URL}/api/v1/leads/${leadId}` : `${API_BASE_URL}/api/v1/leads`;
        const successMessage = isEditMode ? 'Lead atualizado e salvo com sucesso!' : 'Lead criado com sucesso!';


        try {
            await method(url, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setToastMessage({ message: successMessage, type: 'success' });
            
            // Limpa o formulário apenas se for criação
            if (!isEditMode) {
                setFormData({
                    name: '', phone: '', document: '', address: '',
                    status: STAGES[0], origin: '', email: '', uc: '',
                    avgConsumption: '', estimatedSavings: '', qsa: '', notes: '',
                });
            }

        } catch (error) {
            console.error('Erro ao salvar lead:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || (isEditMode ? 'Erro desconhecido ao atualizar o lead.' : 'Erro desconhecido ao salvar o lead.');
            setToastMessage({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            {toastMessage && (
                <Toast 
                    message={toastMessage.message} 
                    type={toastMessage.type} 
                    onClose={() => setToastMessage(null)} 
                />
            )}
            
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 space-y-6">
                
                <div className="flex justify-between items-center border-b pb-4">
                    <button 
                        onClick={handleBack} 
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span>Voltar para o Kanban</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isEditMode ? `Edição do Lead: ${formData.name}` : 'Cadastro de Novo Lead'}
                    </h1>
                    <div className="w-20"></div> {/* Espaçador */}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Linha 1: Nome, Telefone, Documento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo <span className="text-red-500">*</span></label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                            <input type="text" id="document" name="document" value={formData.document} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    
                    {/* Linha 2: Email, UC, Origem */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="uc" className="block text-sm font-medium text-gray-700">UC (Unidade Consumidora)</label>
                            <input type="text" id="uc" name="uc" value={formData.uc} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origem do Lead</label>
                            <input type="text" id="origin" name="origin" value={formData.origin} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    {/* Linha 3: Endereço, Consumo, Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="avgConsumption" className="block text-sm font-medium text-gray-700">Consumo Médio (kWh)</label>
                            <input type="number" id="avgConsumption" name="avgConsumption" value={formData.avgConsumption} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            {/* O status deve ser sempre editável, em criação ou edição */}
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500">
                                {STAGES.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Linha 4: Economia, QSA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="estimatedSavings" className="block text-sm font-medium text-gray-700">Economia Estimada (R$)</label>
                            <input type="number" id="estimatedSavings" name="estimatedSavings" value={formData.estimatedSavings} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="qsa" className="block text-sm font-medium text-gray-700">QSA (Quadro de Sócios)</label>
                            <input type="text" id="qsa" name="qsa" value={formData.qsa} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    
                    {/* 💡 NOVO: Campo de Reatribuição (Visível apenas para Admin e em modo de edição) */}
                    {(isAdmin && isEditMode) && (
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Transferir Lead para:</label>
                            <select
                                id="assignedTo"
                                value={assignedToId}
                                onChange={(e) => setAssignedToId(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Manter Responsável Atual --</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Área de Notas */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas {isEditMode ? 'Existentes/Novas' : 'Iniciais'} (Uma por linha)</label>
                        <textarea 
                            id="notes" 
                            name="notes" 
                            rows="4" 
                            value={formData.notes} 
                            onChange={handleInputChange} 
                            placeholder="Ex: Cliente interessado, prefere contato por WhatsApp. Consumo alto em horário de pico."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Botão de Submissão */}
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
                                <span>{isEditMode ? 'Salvar Alterações do Lead' : 'Salvar Novo Lead'}</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LeadForm;