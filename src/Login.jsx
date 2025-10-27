// src/Login.jsx 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 'Link' foi removido pois não é mais necessário
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
// Importações de ícones originais (adaptadas para o exemplo)
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa'; 

// 🚨 Mantendo a importação original, se existir
// import EconomizaSulLogo from './ECONOMIZASUL.png'; 

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

            // Supondo que a função login armazene o token e os dados do usuário
            login(response.data.token, response.data); 
            navigate('/dashboard', { replace: true });

        } catch (err) {
            console.error('Erro de Login:', err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Falha ao conectar. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // **********************************************
        // REVERTIDO AO LAYOUT ORIGINAL
        // **********************************************
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    {/* Se você tiver uma logo, insira-a aqui */}
                    {/* <img className="mx-auto h-12 w-auto" src={EconomizaSulLogo} alt="Logo" /> */}
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Acesse sua conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Entre com suas credenciais
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Mensagem de Erro/Sucesso */}
                    {error && (
                        <div className="text-sm font-medium text-red-600 text-center p-2 bg-red-50 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Campo Email */}
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="E-mail"
                                className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>

                        {/* Campo Senha */}
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Senha"
                                className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Checkbox/Link Esqueceu a Senha (Mantido como estava) */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Lembrar de mim
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    </div>

                    {/* Botão de Entrar */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition duration-150"
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
                                    <FaSignInAlt className="h-5 w-5 mr-2" />
                                    <span>Entrar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* *****************************************************************
                    CRÍTICO: REMOÇÃO DO LINK DE CADASTRO PÚBLICO CONFORME SOLICITADO
                    *****************************************************************
                */}
                
            </div>
        </div>
    );
};

export default Login;