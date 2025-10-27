// src/Register.jsx

import React, { useState } from 'react';
// Removida a importação 'Link' pois a rota agora é protegida
import { useNavigate } from 'react-router-dom'; 
// Adicionados ícones Phone e Users e importado useAuth
import { User, Mail, Lock, LogIn, Loader2, Phone, Users } from 'lucide-react'; 
import { useAuth } from './AuthContext.jsx'; 

// Usa a variável de ambiente VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Alteração: Componente agora é para cadastro de novos usuários pelo Admin
function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // Novo campo: Telefone
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Novo campo: Tipo de Usuário (Padrão: user)
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // Pega o usuário logado para obter o token (Admin)
    const { user } = useAuth(); 

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Tentando criar novo usuário...');

        // Validação básica
        if (!name || !email || !phone || !password || !role) {
            setMessage('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }
        
        // Verifica se o admin está logado (possui token) antes de tentar o cadastro
        const token = user?.token || localStorage.getItem('token');
        if (!user || !token || user.role !== 'admin') {
            setMessage('Erro: Apenas administradores podem criar novos usuários.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // CRÍTICO: Envia o token do ADMIN para autorização
                    'Authorization': `Bearer ${token}` 
                },
                // Dados completos: name, email, phone, password, role
                body: JSON.stringify({ name, email, phone, password, role }),
            });

            if (response.ok) {
                setMessage(`Usuário ${role.toUpperCase()} criado com sucesso!`);
                // Limpa o formulário
                setName('');
                setEmail('');
                setPhone('');
                setPassword('');
                setRole('user');
                
            } else {
                const errorData = await response.json();
                setMessage(`Falha ao criar usuário: ${errorData.error || response.statusText}. Verifique se o Admin tem permissão.`);
            }
        } catch (error) {
            console.error('Erro de Registro:', error);
            setMessage('Erro de conexão com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Alterado o layout para ter um visual mais 'limpo' de página de gestão.
        <div className="flex items-start justify-center min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-6">
                    {/* Alterado título para refletir a nova funcionalidade */}
                    <h2 className="mt-2 text-3xl font-extrabold text-indigo-900">
                        Criação de Novo Usuário
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Preencha os dados do novo acesso
                    </p>
                </div>
                
                {/* Mensagens de Erro/Sucesso */}
                {message && message !== 'Tentando criar novo usuário...' && (
                    <div className={`p-3 mb-4 rounded-lg text-sm text-center ${message.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleRegister}>
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

                    {/* Campo Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Endereço de E-mail"
                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    {/* NOVO CAMPO: Telefone */}
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

                    {/* Campo Senha */}
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
                            placeholder="Definir Senha"
                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    {/* NOVO CAMPO: Tipo de Usuário (Role) */}
                    <div className="relative">
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

                    {/* Botão de Registro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        ) : (
                            <LogIn className="w-5 h-5 mr-3" />
                        )}
                        {loading ? 'Criando...' : 'Criar Novo Usuário'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;