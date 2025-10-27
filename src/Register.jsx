// src/Register.jsx - TELA DE GESTÃO DE USUÁRIOS (Admin) com Debugging

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Certifique-se de que todas essas imports estão disponíveis no seu projeto
import { User, Mail, Lock, LogIn, Loader2, Phone, Users, Search, ToggleLeft, ToggleRight, X } from 'lucide-react'; 
import { useAuth } from './AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

function UserManagement() {
    // Estados do Formulário de Usuário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); 
    const [role, setRole] = useState('user');
    const [isActive, setIsActive] = useState(true); 
    
    // Estados para Busca e Modo de Formulário
    const [searchQuery, setSearchQuery] = useState(''); 
    const [isEditMode, setIsEditMode] = useState(false);
    const [userId, setUserId] = useState(null); 
    
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();

    // ----------------------------------------------------
    // LÓGICA DE BUSCA SIMPLIFICADA E DIRETA
    // ----------------------------------------------------
    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const token = user?.token || localStorage.getItem('token');
        if (!token || user.role.toLowerCase() !== 'admin') {
            setMessage('Acesso negado. Apenas administradores podem gerenciar usuários.');
            setLoading(false);
            return;
        }
        
        if (!searchQuery.trim()) {
            setMessage('Por favor, insira um nome ou e-mail para buscar.');
            setLoading(false);
            return;
        }

        const isEmailSearch = searchQuery.includes('@');
        const searchType = isEmailSearch ? 'email' : 'name';
        const encodedValue = encodeURIComponent(searchQuery);

        const searchUrl = `${API_BASE_URL}/api/v1/users/search?${searchType}=${encodedValue}`;
        let success = false;
        let finalUser = null;

        // 🚨 NOVO: Loga o URL exato para debugging do Backend
        console.log(`[DEBUG - FRONTEND] Tentando buscar com URL: ${searchUrl}`);

        try {
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                },
            });
            
            // 🚨 NOVO: Loga o Status de Resposta
            console.log(`[DEBUG - FRONTEND] Status da Resposta: ${response.status}`);

            if (response.ok) {
                const userData = await response.json();
                finalUser = Array.isArray(userData) ? userData[0] : userData;
                success = !!finalUser && !!finalUser._id;
            } else if (response.status === 404) {
                 setMessage('Usuário não encontrado. Você pode criar um novo com esta informação.');
            } else {
                const errorData = await response.json();
                setMessage(`Falha na busca: ${errorData.error || response.statusText}.`);
            }

        } catch (error) {
            console.error('[DEBUG - FRONTEND] Erro de Conexão:', error);
            setMessage('Erro de conexão com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }

        // --------------------------------
        // Lógica de Preenchimento do Formulário
        // --------------------------------
        if (success && finalUser) {
            if (finalUser._id === user._id) {
                setMessage('Você carregou seus próprios dados. Você não pode inativar sua própria conta.');
            } else {
                setMessage(`Usuário ${finalUser.name || finalUser.email} carregado com sucesso para edição.`);
            }
            
            setUserId(finalUser._id);
            setName(finalUser.name || ''); 
            setEmail(finalUser.email || '');
            setPhone(finalUser.phone || '');
            setRole(finalUser.role || 'user');
            setIsActive(finalUser.isActive !== undefined ? finalUser.isActive : true); 
            setPassword(''); 
            
            setIsEditMode(true);
        } else if (!isEditMode) {
             resetFormState(); 
             if (isEmailSearch) {
                 setEmail(searchQuery);
             } else {
                 setName(searchQuery);
             }
             setIsEditMode(false);
        }
    };
    
    // ... restante do código (handleSubmit, resetFormState, e JSX) MANTIDO IGUAL ...
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(isEditMode ? 'Tentando salvar edição...' : 'Tentando criar novo usuário...');

        const token = user?.token || localStorage.getItem('token');
        if (!token || user.role.toLowerCase() !== 'admin') {
            setMessage('Acesso negado. Apenas administradores podem gerenciar usuários.');
            setLoading(false);
            return;
        }

        const endpoint = isEditMode 
            ? `${API_BASE_URL}/api/v1/users/${userId}` 
            : `${API_BASE_URL}/api/v1/auth/register`; 
            
        const method = isEditMode ? 'PATCH' : 'POST';
        
        const payload = isEditMode
            ? { name, email, phone, role, isActive } 
            : { name, email, phone, password, role: role || 'user' }; 

        // Validações
        if (!isEditMode && (!name || !email || !phone || !password)) {
             setMessage('Preencha Nome, E-mail, Telefone e Senha para criar um novo usuário.');
             setLoading(false);
             return;
        }
        if (isEditMode && (!name || !email || !phone)) {
            setMessage('Preencha Nome, E-mail e Telefone para editar o usuário.');
            setLoading(false);
            return;
       }


        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage(isEditMode 
                    ? `Usuário ${name} (${role.toUpperCase()}) atualizado com sucesso!` 
                    : `Novo usuário ${role.toUpperCase()} criado com sucesso!`);
                
                // Se o Admin inativar a si mesmo, força o logout.
                if (isEditMode && !isActive && userId === user._id) {
                    setMessage('Sua conta foi inativada. Redirecionando para o Login.');
                    setTimeout(logout, 3000); 
                }
                
                resetFormState(true);
                
            } else {
                const errorData = await response.json();
                setMessage(`Falha ao ${isEditMode ? 'atualizar' : 'criar'} usuário: ${errorData.error || response.statusText}.`);
            }
        } catch (error) {
            console.error('Erro de Conexão:', error);
            setMessage('Erro de conexão com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };
    
    // Reseta o estado do formulário
    const resetFormState = (clearSearch = false) => {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setRole('user');
        setIsActive(true);
        setUserId(null);
        setIsEditMode(false);
        if (clearSearch) {
            setSearchQuery('');
            setMessage('');
        }
    }


    return (
        <div className="flex items-start justify-center min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-6">
                    <h2 className="mt-2 text-3xl font-extrabold text-indigo-900">
                        Gestão de Usuários do Sistema
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Crie novos acessos ou edite/inative usuários existentes
                    </p>
                </div>
                
                {/* Mensagens de Erro/Sucesso */}
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm text-center ${message.includes('sucesso') || message.includes('carregado') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message}
                    </div>
                )}
                
                {/* --------------------------- */}
                {/* CAMPO DE BUSCA */}
                {/* --------------------------- */}
                <form className="mb-6 border-b pb-4" onSubmit={handleSearch}>
                    <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar Usuário (Nome ou E-mail)
                    </label>
                    <div className="flex space-x-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="searchQuery"
                                name="searchQuery"
                                type="text"
                                required
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nome ou E-mail do usuário" 
                                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchQuery}
                            className="flex-shrink-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Buscar'}
                        </button>
                    </div>
                </form>

                {/* --------------------------- */}
                {/* FORMULÁRIO DE CADASTRO/EDIÇÃO */}
                {/* --------------------------- */}
                {(isEditMode || (searchQuery && !loading && !message.includes('não encontrado') && !message.includes('Falha na busca'))) && (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {isEditMode ? `Editando Usuário: ${name || email}` : 'Novo Cadastro'}
                        </h3>
                        
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            
                            {/* Campo E-mail (read-only na edição) */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    readOnly={isEditMode} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Endereço de E-mail"
                                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${isEditMode ? 'bg-gray-100 border-gray-300 text-gray-600' : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'}`}
                                />
                            </div>
                            
                            {/* Campo Nome */}
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome Completo"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Campo Telefone */}
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Telefone (ex: 5541999999999)"
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Campo Senha (Apenas na Criação) */}
                            {!isEditMode && (
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Definir Senha Inicial"
                                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            )}
                            
                            <div className="flex space-x-4">
                                {/* Campo Tipo de Usuário (Role) */}
                                <div className="relative flex-1">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="user">Usuário Comum</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                
                                {/* Campo Ativo/Inativo (Apenas na Edição) */}
                                {isEditMode && (
                                    <div className="flex items-center space-x-3 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 flex-1">
                                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (userId !== user._id) {
                                                    setIsActive(!isActive)
                                                } else {
                                                    setMessage('Você não pode inativar sua própria conta.');
                                                }
                                            }}
                                            className={`flex items-center text-sm font-medium rounded-full p-1 transition duration-150 ${isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                            aria-checked={isActive}
                                            disabled={userId === user._id}
                                        >
                                            {isActive ? (
                                                <ToggleRight className="w-8 h-8 text-white" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8 text-white" />
                                            )}
                                            <span className="ml-2 text-white">{isActive ? 'Ativo' : 'Inativo'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Botão de Submissão */}
                            <div className="pt-2 flex space-x-2">
                                <button
                                    type="submit"
                                    disabled={loading || (isEditMode && userId === user._id && !isActive)} 
                                    className="group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin w-5 h-5 mr-3" />
                                    ) : (
                                        <LogIn className="w-5 h-5 mr-3" />
                                    )}
                                    {loading ? 'Processando...' : (isEditMode ? 'Salvar Edição' : 'Criar Novo Usuário')}
                                </button>
                                
                                {/* Botão Limpar/Cancelar Edição */}
                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() => resetFormState(true)}
                                        className="group relative w-1/4 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                                    >
                                        <X className="w-5 h-5 mr-1" />
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}
                
                {/* Mensagem de instrução quando o formulário está vazio */}
                {!isEditMode && !searchQuery && !loading && (
                     <div className="p-4 text-center text-gray-500">
                        Use o campo acima para buscar um usuário existente ou comece digitando o nome/e-mail para criar um novo.
                     </div>
                )}
            </div>
        </div>
    );
}

export default UserManagement;