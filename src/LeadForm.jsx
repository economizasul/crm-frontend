import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react'; // Ícones lucide

// Importe o Toast ou use um componente de notificação se tiver um
const Toast = ({ message, type }) => (
    <div className={`p-3 rounded-lg text-white font-medium shadow-lg absolute top-4 right-4 z-50 transition-opacity duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
        {message}
    </div>
);

// CORREÇÃO: Usando process.env para maior compatibilidade com diferentes ambientes de build.
// Use process.env.VITE_APP_BACKEND_URL ou a URL local como fallback.
const API_URL = process.env.VITE_APP_BACKEND_URL || 'http://localhost:5000/api/v1';

const LeadForm = ({ isOpen, onClose, onLeadCreated }) => {
    // 1. Estado para os campos principais do formulário
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        document: '', // CPF/CNPJ
        address: '', 
        origin: 'site', 
        status: 'Para Contatar', 
        notes: [],
        qsa: '', 
        uc: '', 
        avgConsumption: '', 
        estimatedSavings: '',
    });
    
    // 2. Estados de controle
    const [currentNote, setCurrentNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Efeito para resetar o formulário ao abrir/fechar o modal
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                phone: '',
                document: '',
                address: '',
                origin: 'site',
                status: 'Para Contatar',
                notes: [],
                qsa: '',
                uc: '',
                avgConsumption: '',
                estimatedSavings: '',
            });
            setCurrentNote('');
            setNotification(null);
        }
    }, [isOpen]);

    // Manipulador de alterações nos campos de texto/seleção
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Adiciona anotação à lista
    const addNote = () => {
        if (currentNote.trim()) {
            const timestamp = new Date().toLocaleString('pt-BR');
            const newNote = `[${timestamp}] - ${currentNote.trim()}`;
            setFormData(prev => ({
                ...prev,
                notes: [...prev.notes, newNote]
            }));
            setCurrentNote('');
        }
    };
    
    // Função principal de submissão do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);
        
        // 1. Obtém o token (necessário para o middleware 'protect' do Backend)
        const token = localStorage.getItem('token'); 
        if (!token) {
            setNotification({ message: 'Erro: Usuário não autenticado.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            // 2. Prepara o payload para o Backend
            // O Backend espera todos esses campos no body, ele cuida de empacotar no JSONB
            const payload = {
                ...formData,
                avgConsumption: parseFloat(formData.avgConsumption) || 0, // Garante que seja float ou 0
                estimatedSavings: parseFloat(formData.estimatedSavings) || 0, // Garante que seja float ou 0
                // Garantir que 'notes' seja um array
                notes: formData.notes || [], 
            };
            
            // 3. Chamada da API
            const response = await axios.post(`${API_URL}/leads`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // 4. Sucesso: Notifica o usuário e chama o callback para atualizar o Dashboard
            setNotification({ message: 'Lead cadastrado com sucesso!', type: 'success' });
            
            // Chama a função passada pelo Dashboard para recarregar a lista
            onLeadCreated(response.data); 

            // Fecha o modal após um pequeno delay para mostrar a notificação
            setTimeout(onClose, 1000); 

        } catch (error) {
            // 5. Trata Erros
            const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido ao cadastrar o lead.';
            setNotification({ message: errorMessage, type: 'error' });
            console.error("Erro ao submeter lead:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Estrutura do Modal
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 p-4">
            {notification && <Toast message={notification.message} type={notification.type} />}

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 p-6 sm:p-8">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Novo Lead de Energia Solar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Seção Principal de Contato */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="(XX) XXXXX-XXXX"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                            <input
                                type="text"
                                name="document"
                                value={formData.document}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Consumidora (UC)</label>
                            <input
                                type="text"
                                name="uc"
                                value={formData.uc}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                    </div>
                    
                    {/* Seção de Origem e Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Lead</label>
                            <select
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white"
                            >
                                <option value="site">Site/Landing Page</option>
                                <option value="indicacao">Indicação</option>
                                <option value="coldcall">Prospecção Ativa (Cold Call)</option>
                                <option value="social">Redes Sociais</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Inicial</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white"
                            >
                                <option value="Para Contatar">Para Contatar</option>
                                <option value="Em Negociação">Em Negociação</option>
                                <option value="Proposta Enviada">Proposta Enviada</option>
                                <option value="Fechado">Fechado</option>
                                <option value="Perdido">Perdido</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Seção de Endereço e QSA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        ></textarea>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">QSA (Quadro de Sócios e Administradores)</label>
                        <textarea
                            name="qsa"
                            value={formData.qsa}
                            onChange={handleChange}
                            rows="2"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        ></textarea>
                    </div>
                    
                    {/* Seção de Dados de Consumo (Opcional) */}
                    <h3 className="text-xl font-semibold text-gray-700 pt-4 border-t mt-6">Estimativa de Consumo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Consumo Médio (kWh/mês)</label>
                            <input
                                type="number"
                                name="avgConsumption"
                                value={formData.avgConsumption}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Economia Estimada (R$/mês)</label>
                            <input
                                type="number"
                                name="estimatedSavings"
                                value={formData.estimatedSavings}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                    </div>
                    
                    {/* Seção de Anotações */}
                    <h3 className="text-xl font-semibold text-gray-700 pt-4 border-t mt-6">Anotações do Vendedor</h3>
                    <div className="space-y-3">
                        {/* Lista de Anotações */}
                        <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto border border-gray-200">
                            {formData.notes.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">Nenhuma anotação adicionada ainda.</p>
                            ) : (
                                <ul className="space-y-1 text-sm text-gray-700">
                                    {formData.notes.map((note, index) => (
                                        <li key={index} className="border-b last:border-b-0 py-1">{note}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        {/* Campo para nova anotação */}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={currentNote}
                                onChange={(e) => setCurrentNote(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())}
                                placeholder="Adicionar nova anotação..."
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={addNote}
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-150 disabled:bg-gray-400"
                                disabled={!currentNote.trim()}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>

                    {/* Botão de Submissão */}
                    <div className="pt-6 border-t mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !formData.name || !formData.phone}
                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
