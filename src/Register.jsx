import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, LogIn, Loader2 } from 'lucide-react'; 

// Usa a variável de ambiente VITE_API_URL
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
                // O backend que você forneceu espera: name, email, password, (role opcional)
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                // Registro bem-sucedido: Navega para a tela de Login
                setMessage('Conta criada com sucesso! Redirecionando para o login...');
                
                // Redireciona após um pequeno delay para o usuário ler a mensagem
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 1500);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Crie sua conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Cadastre-se para acessar o sistema
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Campo Nome */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm rounded-t-md"
                                placeholder="Seu Nome Completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {/* Campo Email */}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {/* Campo Senha */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm rounded-b-md"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Botão de Registro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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