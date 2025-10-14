import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Define a URL da API, preferindo a variável de ambiente VITE_API_URL 
// ou usando o localhost como fallback.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Chamada à API de autenticação no endpoint /auth/login
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            // 1. VERIFICAÇÃO E GRAVAÇÃO DO TOKEN
            if (response.data && response.data.token) {
                // O token é recebido e gravado no Local Storage
                localStorage.setItem('token', response.data.token);
                
                // 2. REDIRECIONAMENTO PARA O DASHBOARD
                // O 'replace: true' impede que o usuário volte para a tela de login
                navigate('/dashboard', { replace: true });
            } else {
                // Caso a API retorne sucesso, mas sem o token esperado
                setError('Login bem-sucedido, mas o token de autenticação não foi fornecido.');
            }
        } catch (err) {
            // Tratamento de erros de requisição
            // Tenta pegar a mensagem de erro do backend ou usa uma genérica.
            const errorMessage = err.response?.data?.message || 'Erro de conexão ou credenciais inválidas.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform hover:shadow-3xl transition duration-500">
                <h2 className="text-3xl font-extrabold text-indigo-800 text-center mb-6">
                    Acessar o CRM
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4" role="alert">
                        <p className="font-bold">Erro de Login</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            E-mail
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            placeholder="seu.email@exemplo.com"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition duration-300 
                                ${loading 
                                    ? 'bg-indigo-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`
                            }
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Não tem conta? 
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                        Registre-se aqui
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
