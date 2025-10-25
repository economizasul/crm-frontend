// src/Login.jsx - CÓDIGO FINAL COM LAYOUT RESPONSIVO (DESKTOP E MOBILE)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
                email,
                password,
            });

            // Chama a função de login do contexto para salvar o token e os dados
            login(response.data.token, response.data); 

            // Redireciona para o dashboard
            navigate('/dashboard', { replace: true });

        } catch (err) {
            console.error('Erro de Login:', err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Falha ao conectar. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Container Principal (Tela Cheia)
        <div className="min-h-screen flex">
            
            {/* 1. Coluna de Conteúdo/Imagem (Visível Apenas em Desktop) */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-indigo-600 text-white p-12 shadow-2xl">
                {/* 🚨 Substitua 'sua-imagem-de-fundo.jpg' pela URL real da imagem da sua marca 
                  Ou use apenas o background sólido como está.
                */}
                <div 
                    className="w-full h-full bg-cover bg-center rounded-lg flex flex-col justify-center items-center" 
                    style={{ 
                        // Exemplo de como adicionar a imagem (Substitua a URL)
                        // backgroundImage: "url('URL_DA_SUA_IMAGEM_DE_FUNDO.jpg')",
                        backgroundColor: '#4f46e5', // Fundo sólido (Indigo 600)
                    }}
                >
                    <h1 className="text-5xl font-extrabold mb-4">Bem-vindo(a)</h1>
                    <p className="text-xl text-indigo-200">Faça login para acessar o sistema CRM da Economiza Sul.</p>
                </div>
            </div>
            
            {/* 2. Coluna do Formulário (Visível em Mobile e Desktop) */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-50 p-8 md:p-12">
                <div className="w-full max-w-md">
                    
                    {/* Cabeçalho */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 md:text-gray-800">
                            Acessar o Sistema
                        </h2>
                        {/* Visível apenas em mobile */}
                        <p className="mt-2 text-sm text-gray-600 md:hidden">
                            Economiza Sul CRM
                        </p>
                    </div>

                    {/* Formulário */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        
                        {/* Campo Email */}
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                    placeholder="Seu Email"
                                />
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                    placeholder="Sua Senha"
                                />
                            </div>
                        </div>

                        {/* Exibir Erro */}
                        {error && (
                            <div className="text-red-600 text-sm text-center p-2 bg-red-100 rounded-lg" role="alert">
                                {error}
                            </div>
                        )}

                        {/* Botão de Login */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Aguarde...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt className="h-5 w-5" />
                                        <span>Entrar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Link para Cadastro */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Crie uma aqui
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;