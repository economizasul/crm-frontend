import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 🚨 CORREÇÃO 1: Importar useAuth
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Componente simples de Toast para feedback ao usuário
const Toast = ({ message, type, onClose }) => {
    // 🚨 CORREÇÃO 2: useEffect para fechar automaticamente
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3500); 
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    
    return (
        // Posição ajustada para ser mais visível e não conflitar com o conteúdo
        <div className={`p-3 rounded-lg text-white font-medium shadow-xl fixed top-4 right-4 z-50 ${bgColor}`}>
            <div className="flex items-center justify-between space-x-2">
                <span>{message}</span>
                <button onClick={onClose} className="text-white hover:text-gray-200">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

const LeadForm = () => {
    const navigate = useNavigate();
    // 🚨 CORREÇÃO 3: Obter token do contexto
    const { token } = useAuth();

    // Estado inicial com todos os campos necessários (mantido da sua estrutura)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        document: '', 
        address: '', 
        origin: 'site', 
        status: 'Para Contatar', 
        notes: '', 
        qsa: '', 
        uc: '', 
        avgConsumption: '', 
        estimatedSavings: '',
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast(null);

        // 1. Verificação do Token
        if (!token) {
            setToast({ message: 'Sessão expirada. Faça login novamente.', type: 'error' });
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // 2. Preparar os dados para envio
        const dataToSend = {
            ...formData,
            // O Backend espera um array de notes
            notes: formData.notes.trim() ? [formData.notes] : [], 
        };
        
        try {
            // 3. Requisição POST para o Endpoint de Leads (Usando o padrão v1/leads)
            const response = await axios.post(`${API_BASE_URL}/api/v1/leads`, dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Autenticação
                },
            });

            // 4. Sucesso
            if (response.status === 201) {
            setToast({ message: 'Lead cadastrado com sucesso!', type: 'success' });
                // Limpa o formulário e mantém na mesma página para um novo cadastro
                setFormData({
                    name: '',
                    phone: '',
                    document: '',
                    address: '',
                    origin: 'site',
                    status: 'Para Contatar',
                    notes: '',
                    qsa: '',
                    uc: '',
                    avgConsumption: '',
                    estimatedSavings: '',
                });
                // Foca no primeiro campo para próximo cadastro
                const nameInput = document.getElementById('name');
                if (nameInput) nameInput.focus();    
            } else {
                setToast({ message: 'Erro desconhecido ao cadastrar o lead.', type: 'error' });
            }

        } catch (error) {
            console.error('Erro de API ao cadastrar lead:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || 'Falha na conexão com o servidor.';
            setToast({ message: `Erro: ${errorMessage}`, type: 'error' });

            if (error.response?.status === 401) {
                setToast({ message: 'Não autorizado. Redirecionando para login.', type: 'error' });
                setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Exibe o Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
              
                {/* Cabeçalho */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-3xl font-extrabold text-indigo-800">
                        Cadastro de Novo Lead
                    </h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition duration-150"
                        title="Voltar ao Dashboard"
                    >
                        <ArrowLeft size={24} />
                        <span>Voltar</span>
                    </button>
                </div>

                {/* Formulário (Restante do seu JSX) */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Seção 1: Dados Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">
                        <h3 className="md:col-span-2 text-xl font-semibold text-gray-700 mb-2 border-b pb-2">Informações Básicas</h3>
                        
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo <span className="text-red-500">*</span></label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel" // Alterado para tel para semântica mobile
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>

                        {/* ... (Outros campos da Seção 1) ... */}
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                            <input 
                                id="document" 
                                name="document" 
                                type="text" 
                                value={formData.document} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading} 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                            <input 
                                id="address" 
                                name="address" 
                                type="text" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading} 
                            />
                        </div>
                    </div> 

                    {/* Seção 2: Detalhes de Consumo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">
                        <h3 className="md:col-span-2 text-xl font-semibold text-gray-700 mb-2 border-b pb-2">Dados de Consumo</h3>
                        
                        <div>
                            <label htmlFor="uc" className="block text-sm font-medium text-gray-700">Número da UC (Unidade Consumidora)</label>
                            <input 
                                id="uc" 
                                name="uc" 
                                type="text" 
                                value={formData.uc} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading} 
                            />
                        </div>

                        <div>
                            <label htmlFor="avgConsumption" className="block text-sm font-medium text-gray-700">Consumo Médio (kWh)</label>
                            <input 
                                id="avgConsumption" 
                                name="avgConsumption" 
                                type="number" 
                                value={formData.avgConsumption} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading} 
                            />
                        </div>

                        <div>
                            <label htmlFor="estimatedSavings" className="block text-sm font-medium text-gray-700">Economia Estimada</label>
                            <input 
                                id="estimatedSavings" 
                                name="estimatedSavings" 
                                type="text" 
                                value={formData.estimatedSavings} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading} 
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="qsa" className="block text-sm font-medium text-gray-700">QSA (Quadro de Sócios e Administradores)</label>
                            <input 
                                id="qsa" 
                                name="qsa" 
                                type="text" 
                                value={formData.qsa} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading} 
                            />
                        </div>
                    </div>

                    {/* Seção 3: Status e Notas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">
                        <h3 className="md:col-span-2 text-xl font-semibold text-gray-700 mb-2 border-b pb-2">Acompanhamento</h3>
                        
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                id="status" 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading}
                            >
                                <option>Para Contatar</option>
                                <option>Em Conversação</option>
                                <option>Proposta Enviada</option>
                                <option>Fechado</option>
                                <option>Perdido</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas Iniciais</label>
                            <textarea 
                                id="notes" 
                                name="notes" 
                                rows="3"
                                value={formData.notes} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                                disabled={loading}
                            ></textarea>
                        </div>
                    </div>

                    {/* Botão de Submissão */}
                    <div className="pt-4">
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
                                    <span>Salvar Novo Lead</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadForm;