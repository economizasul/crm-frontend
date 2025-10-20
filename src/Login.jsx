import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

// URL DO BACKEND - Usando a URL estática para evitar erro de import.meta.env
const API_BASE_URL = 'https://crm-app-cnf7.onrender.com';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // Usando o hook do AuthContext
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Tentando login...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                
                
                login(data.token, data.id || data.userId);
                
                setMessage('Login realizado com sucesso! Redirecionando...');
                
                // Redireciona APÓS o estado ser atualizado e o token salvo
                navigate('/dashboard', { replace: true });
            } else {
                const errorData = await response.json();
                setMessage(`Falha no login: ${errorData.error || response.statusText}`);
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
                        ECONOMIZA SUL CRM
                    </h1>
                    <h2 className="mt-2 text-xl font-semibold text-gray-600 flex items-center justify-center space-x-2">
                        <LogIn className="w-6 h-6 text-indigo-500" />
                        <span>ACESSAR</span>
                    </h2>
                </div>

                {/* Formulário (Mantido) */}
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
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
                                    className="appearance-none rounded-t-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-b-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botão de Entrar */}
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
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                
                {/* Mensagens de Erro/Sucesso e Link de Cadastro (Mantidos) */}
                {message && message !== 'Tentando login...' && (
                    <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message}
                    </div>
                )}
                
                <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition duration-150">
                            Crie uma aqui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
