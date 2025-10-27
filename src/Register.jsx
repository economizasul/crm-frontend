import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Search, User, Phone, Briefcase, ToggleRight, ToggleLeft, Save, Plus, X, Loader2 } from 'lucide-react'; 
import { useAuth } from './AuthContext'; // Assume que você tem um AuthContext
import { toast } from 'react-toastify'; // Use uma biblioteca de notificações (opcional)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Estrutura de dados inicial para o formulário
const initialFormState = {
    id: null,
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
    password: '', // Campo para novo cadastro
    isEditing: false,
};

function UserRegister() {
    const { user: authUser, token } = useAuth(); // Pega o usuário logado e o token
    
    // Estado do formulário (inclui o usuário atual ou os dados para novo cadastro)
    const [formData, setFormData] = useState(initialFormState);
    
    // Estado do campo de busca
    const [searchQuery, setSearchQuery] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [message, setMessage] = useState('');

    // Efeito para limpar o formulário quando o Admin decide fazer um novo cadastro sem busca
    const handleClearForm = () => {
        setFormData(initialFormState);
        setSearchQuery('');
        setSearchPerformed(false);
        setMessage('Pronto para cadastrar um novo usuário.');
    };

    // 1. Lógica de Busca de Usuário (GET)
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        // Determina se a busca é por email ou nome (o backend aceita ambos)
        const isEmail = searchQuery.includes('@');
        const queryParam = isEmail ? `email=${searchQuery}` : `name=${searchQuery}`;
        
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/users/search?${queryParam}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Se o usuário for encontrado (Status 200)
            const userData = response.data;
            
            // Mapeia os dados do backend para o estado
            setFormData({
                id: userData.id || userData._id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '', // Puxa 'phone' (agora que a coluna existe)
                role: userData.role,
                isActive: userData.isActive, // Puxa 'isActive' (com o aliasing)
                password: '', // Senha é ignorada na edição
                isEditing: true, // Modo Edição
            });
            setMessage(`Usuário "${userData.name}" encontrado. Editando...`);
            setSearchPerformed(true);

        } catch (error) {
            
            // LÓGICA CRÍTICA: TRATAMENTO DO 404
            if (error.response && error.response.status === 404) {
                // Usuário NÃO encontrado. Configura o estado para NOVO CADASTRO.
                setFormData({
                    ...initialFormState,
                    email: isEmail ? searchQuery : '', // Pré-preenche o email se a busca foi por email
                    name: isEmail ? '' : searchQuery,   // Pré-preenche o nome se a busca foi por nome
                    isEditing: false, // Modo Novo Cadastro
                });
                setMessage('Usuário não encontrado. Você pode criar um novo com esta informação.');
                setSearchPerformed(true);
                // toast.info('Usuário não encontrado. Pronto para criar um novo.');

            } else {
                // Outro erro (401, 500, etc.)
                const errorMessage = error.response?.data?.error || 'Erro interno do servidor ao buscar.';
                setMessage(`Falha na busca: ${errorMessage}`);
                setFormData(initialFormState); // Limpa o formulário em caso de erro grave
            }

        } finally {
            setLoading(false);
        }
    };

    // 2. Lógica de Cadastro ou Edição (POST/PATCH)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Salvando...');

        const url = formData.isEditing 
            ? `${API_BASE_URL}/api/v1/users/${formData.id}` // PATCH para Edição
            : `${API_BASE_URL}/api/v1/auth/register`;      // POST para Novo Cadastro
        
        const method = formData.isEditing ? 'PATCH' : 'POST';

        // Prepara o corpo da requisição
        let body;
        if (formData.isEditing) {
            // Edição: Envia todos os campos, exceto a senha (o backend deve ignorar senha vazia ou ter uma rota separada)
            body = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                isActive: formData.isActive,
                // A senha não deve ser enviada para PATCH a menos que seja para trocá-la
            };
        } else {
            // Novo Cadastro: Requer senha
            if (!formData.password) {
                setMessage('Para novo cadastro, a senha é obrigatória.');
                setLoading(false);
                return;
            }
            body = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                password: formData.password,
                // isActive é TRUE por padrão
            };
        }

        try {
            const response = await axios({
                method: method,
                url: url,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                data: body,
            });

            if (response.status === 200 || response.status === 201) {
                setMessage(`Usuário ${formData.isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
                
                // Se for um novo cadastro, limpa o formulário
                if (!formData.isEditing) {
                    setFormData(initialFormState);
                    setSearchPerformed(false); // Volta para o modo de busca
                    setSearchQuery('');
                }
                
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || `Erro interno do servidor ao ${formData.isEditing ? 'atualizar' : 'cadastrar'}.`;
            setMessage(`Falha ao ${formData.isEditing ? 'atualizar' : 'cadastrar'} usuário: ${errorMessage}`);

        } finally {
            setLoading(false);
        }
    };


    // Condição para mostrar o formulário
    // O formulário aparece se:
    // 1. Uma busca foi realizada (searchPerformed) E
    // 2. O usuário foi encontrado (isEditing é TRUE) OU
    // 3. O usuário não foi encontrado (isEditing é FALSE, mas o email/nome está pré-preenchido)
    const showForm = searchPerformed || formData.id !== null;

    // Se a tela for aberta sem busca, o formulário de cadastro já pode aparecer
    useEffect(() => {
        // Se a tela é renderizada e o form está limpo, mostra a mensagem inicial
        if (!searchPerformed && formData.id === null) {
             setMessage('Digite um nome ou email para buscar um usuário, ou clique em Novo Cadastro.');
        }
    }, [searchPerformed, formData.id]);


    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {formData.isEditing ? `Editar Usuário: ${formData.name}` : 'Cadastro de Novo Usuário'}
            </h1>
            
            {/* Seletor de Modo/Barra de Busca */}
            <div className="flex items-center space-x-4 mb-8">
                <form onSubmit={handleSearch} className="flex flex-1 space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por Email ou Nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
                        disabled={loading || !searchQuery}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                    </button>
                </form>

                {/* Botão para Novo Cadastro (Limpar Busca) */}
                <button
                    onClick={handleClearForm}
                    className="flex items-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition duration-150 disabled:opacity-50"
                    disabled={loading}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Cadastro
                </button>
            </div>


            {/* Mensagem de Status */}
            {message && (
                <div className={`p-3 mb-6 rounded-lg text-sm text-center font-medium 
                    ${message.includes('sucesso') || message.includes('Pronto para') ? 'bg-green-100 text-green-700' : 
                      message.includes('Usuário não encontrado') ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`
                }>
                    {message}
                </div>
            )}
            
            {/* Formulário de Cadastro/Edição (Aparece se showForm for true) */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3">
                        Dados do Usuário
                    </h2>
                    
                    {/* Campo Nome */}
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Campo Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            // Email é editável APENAS se for um NOVO cadastro
                            className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formData.isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            disabled={loading || formData.isEditing} 
                        />
                    </div>
                    
                    {/* Campo Telefone */}
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Telefone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Campo Senha (Apenas em modo Novo Cadastro) */}
                    {!formData.isEditing && (
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Senha (Obrigatório para novo cadastro)"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!formData.isEditing}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>
                    )}
                    
                    {/* Linha de Role e Ativo */}
                    <div className="flex space-x-4">
                        {/* Campo Nível de Acesso (Role) */}
                        <div className="relative flex-1">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                disabled={loading}
                            >
                                <option value="user">Usuário Padrão</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        
                        {/* Toggle Ativo/Inativo */}
                        {formData.isEditing && (
                            <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-white shadow-sm">
                                <label className="text-gray-700 font-medium mr-3">
                                    {formData.isActive ? 'Ativo' : 'Inativo'}
                                </label>
                                <button
                                    type="button"
                                    // Impede o Admin de desativar a própria conta
                                    onClick={() => {
                                        if (formData.id === authUser.id && authUser.role === 'admin') {
                                            setMessage('Um administrador não pode se desativar.');
                                            return;
                                        }
                                        setFormData({ ...formData, isActive: !formData.isActive });
                                    }}
                                    disabled={loading}
                                    className="focus:outline-none"
                                >
                                    {formData.isActive ? (
                                        <ToggleRight className="w-8 h-8 text-green-500" />
                                    ) : (
                                        <ToggleLeft className="w-8 h-8 text-red-500" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botão de Envio */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        ) : (
                            <Save className="w-5 h-5 mr-3" />
                        )}
                        {loading ? 'Salvando...' : formData.isEditing ? 'Salvar Edição' : 'Cadastrar Novo Usuário'}
                    </button>

                </form>
            )}

            
        </div>
    );
}

export default UserRegister;