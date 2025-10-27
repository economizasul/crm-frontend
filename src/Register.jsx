// src/Register.jsx - AGORA É A TELA DE GESTÃO E EDIÇÃO DE USUÁRIOS (Admin)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Loader2, Phone, Users, Search, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Renomeado para refletir a nova funcionalidade de edição/gestão
function UserManagement() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); // Usado apenas para criação
    const [role, setRole] = useState('user');
    const [isActive, setIsActive] = useState(true); // NOVO: Campo de status
    
    // Estados para Busca e Modo de Formulário
    const [searchEmail, setSearchEmail] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [userId, setUserId] = useState(null); // ID do usuário em edição
    
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();

    // ----------------------------------------------------
    // 1. LÓGICA DE BUSCA
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

        try {
            // CRÍTICO: Endpoint de busca (assumindo que o backend suporta buscar por email)
            const response = await fetch(`${API_BASE_URL}/api/v1/users/search?email=${searchEmail}`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                },
            });

            if (response.ok) {
                const userData = await response.json();
                
                // CRÍTICO: Se o usuário logado tentar editar a si mesmo, impede inativação.
                if (userData._id === user._id) {
                    setMessage('Você carregou seus próprios dados. Você não pode inativar sua própria conta.');
                } else {
                    setMessage(`Usuário ${userData.name} carregado com sucesso para edição.`);
                }
                
                // Popula o formulário para edição
                setUserId(userData._id);
                setName(userData.name);
                setEmail(userData.email);
                setPhone(userData.phone || '');
                setRole(userData.role || 'user');
                setIsActive(userData.isActive !== undefined ? userData.isActive : true); // Padrão é ativo
                setPassword(''); // Nunca carrega senha
                
                setIsEditMode(true);
                
            } else if (response.status === 404) {
                setMessage('Usuário não encontrado. Você pode criar um novo com este e-mail.');
                // Limpa e prepara para novo cadastro
                resetFormState(); 
                setEmail(searchEmail);
                setIsEditMode(false);
            } else {
                const errorData = await response.json();
                setMessage(`Falha na busca: ${errorData.error || response.statusText}`);
                resetFormState();
            }
        } catch (error) {
            console.error('Erro de Conexão:', error);
            setMessage('Erro de conexão com o servidor. Tente novamente.');
            resetFormState();
        } finally {
            setLoading(false);
        }
    };
    
    // ----------------------------------------------------
    // 2. LÓGICA DE CRIAÇÃO/EDIÇÃO
    // ----------------------------------------------------
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
            ? `${API_BASE_URL}/api/v1/users/${userId}` // Rota PATCH/PUT para edição
            : `${API_BASE_URL}/api/v1/auth/register`; // Rota POST para criação
            
        const method = isEditMode ? 'PATCH' : 'POST';
        
        // Dados a enviar
        const payload = isEditMode
            ? { name, email, phone, role, isActive } // Edição não envia senha
            : { name, email, phone, password, role }; // Criação exige senha

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
                
                // CRÍTICO: Se o usuário editado for inativado e for o próprio admin, deve deslogar.
                if (isEditMode && !isActive && userId === user._id) {
                    setMessage('Sua conta foi inativada. Redirecionando para o Login.');
                    setTimeout(logout, 3000); 
                }
                
                // Limpa e volta para o modo de busca/criação
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
    
    // Reseta o estado do formulário (mantendo o e-mail de busca)
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
            setSearchEmail('');
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
                    <label htmlFor="searchEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar Usuário por E-mail
                    </label>
                    <div className="flex space-x-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="searchEmail"
                                name="searchEmail"
                                type="email"
                                required
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="E-mail do usuário para edição"
                                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchEmail}
                            className="flex-shrink-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Buscar'}
                        </button>
                    </div>
                </form>

                {/* --------------------------- */}
                {/* FORMULÁRIO DE CADASTRO/EDIÇÃO */}
                {/* --------------------------- */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {isEditMode ? `Editando Usuário: ${name}` : 'Novo Cadastro'}
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
                            readOnly={isEditMode} // Não permite alterar o email na edição
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
                                <option value="user">Usuário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        
                        {/* NOVO CAMPO: Ativo/Inativo (Apenas na Edição) */}
                        {isEditMode && (
                            <div className="flex items-center space-x-3 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 flex-1">
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
                                {/* Lógica para impedir que o Admin inative a si mesmo */}
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
                            disabled={loading || (isEditMode && userId === user._id && !isActive)} // Impede salvar a inativação de si mesmo
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
            </div>
        </div>
    );
}

export default UserManagement;