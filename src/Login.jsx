// src/Login.jsx - CÓDIGO FINAL COM DIVISÃO 70/30, DEGRADÊS DE TRÊS TONS E ESTILOS FINAIS

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa'; 

// IMPORTAÇÃO DA LOGO
import EconomizaSulLogo from './ECONOMIZASUL.png'; 

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

            // O objeto de usuário retornado agora inclui 'role'
            login(response.data.token, response.data); 
            navigate('/dashboard', { replace: true }); 

        } catch (err) {
            console.error('Erro de login:', err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Erro ao tentar conectar. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Seção da Imagem (70%) - Mantida como antes */}
            <div className="hidden lg:flex w-7/12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 justify-center items-center p-10">
                <div className="text-center">
                    <img src={EconomizaSulLogo} alt="Economiza Sul Logo" className="max-h-64 mx-auto mb-6 shadow-2xl rounded-lg" />
                    <h1 className="text-4xl font-extrabold text-white leading-tight">
                        Seu CRM de Leads
                    </h1>
                    <p className="mt-4 text-lg text-indigo-100 font-light">
                        Gerencie contatos, negociações e o funil de vendas em um só lugar.
                    </p>
                </div>
            </div>

            {/* Seção do Formulário de Login (30%) */}
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12 bg-white w-full lg:w-5/12">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <img src={EconomizaSulLogo} alt="Logo" className="w-16 h-16 mx-auto lg:hidden mb-4" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Acessar o Sistema
                        </h2>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200 text-center" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {/* Campo de Email */}
                        <div className="relative">
                            <FaEnvelope className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Campo de Senha */}
                        <div className="relative">
                            <FaLock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

                    {/* REMOVIDO: Bloco 'Link para Cadastro' */}
                    {/* O link "Não tem uma conta? Crie uma aqui" foi removido conforme solicitado */}
                    
                </div>
            </div>
        </div>
    );
};

export default Login;