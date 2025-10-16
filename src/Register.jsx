import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Loader2 } from 'lucide-react'; // Adicionamos 'User' para o campo de Nome

// URL DO BACKEND - Usamos a variável de ambiente para ser flexível
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Tentando registro...');

        // Validação básica
        if (!name || !email || !password) {
            setMessage('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // O backend que você forneceu espera: name, email, password
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok || response.status === 201) {
                setMessage('Registro concluído com sucesso! Redirecionando para o login...');
                
                // Redireciona para o login após 2 segundos
                setTimeout(() => navigate('/login'), 2000), setLoading(false);
            } else {
                const errorData = await response.json();
                setMessage(`Falha no registro: ${errorData.error || response.statusText}`);
            }

        } catch (error) {
            console.error('Erro de rede ou na requisição:', error);
            setMessage('Erro de conexão. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Layout centralizado com fundo sutil
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 space-y-8 rounded-2xl shadow-2xl border border-gray-100">
                
                {/* Cabeçalho */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        GEOCRM
                    </h1>
                    <h2 className="mt-2 text-xl font-semibold text-gray-600 flex items-center justify-center space-x-2">
                        <LogIn className="w-6 h-6 text-indigo-500" />
                        <span>Criar Nova Conta</span>
                    </h2>
                </div>

                {/* Formulário */}
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    
                    {/* Campo Nome */}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Nome</label>
                            <div className="relative">
                                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Nome Completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    // Apenas a primeira borda superior é arredondada (rounded-t-lg)
                                    className="appearance-none rounded-t-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Campo E-mail */}
                        <div>
                            <label htmlFor="email" className="sr-only">E-mail</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    // Borda superior e inferior reta (para agrupar campos)
                                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Senha (mín. 6 caracteres)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    // Apenas a borda inferior é arredondada (rounded-b-lg)
                                    className="appearance-none rounded-b-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botão de Registro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        ) : (
                            <LogIn className="w-5 h-5 mr-3" />
                        )}
                        {loading ? 'Registrando...' : 'Criar Conta'}
                    </button>
                </form>
                
                {/* Mensagens de Erro/Sucesso */}
                {message && message !== 'Tentando registro...' && (
                    <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message}
                    </div>
                )}
                
                {/* Link de Login */}
                <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition duration-150">
                            Faça login aqui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;