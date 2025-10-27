// src/Login.jsx - CÓDIGO FINAL COM DIVISÃO 70/30, DEGRADÊS DE TRÊS TONS E ESTILOS FINAIS

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 'Link' foi removido pois não é mais necessário
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa'; 

// 🚨 IMPORTAÇÃO DA LOGO
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

            login(response.data.token, response.data); 
            navigate('/dashboard', { replace: true });

        } catch (err) {
            console.error('Erro de Login:', err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Falha ao conectar. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    // 🚨 Estilo de degradê LARANJA (Três tons: Branco/Laranja Claro/Laranja Escuro)
    const orangeGradientStyle = {
        background: 'radial-gradient(circle, #FFC28E 0%, #F98828 30%, #935018 100%)',
    };

    // 🚨 Estilo de degradê VERDE INVERSO: Claro na esquerda, Escuro na direita
    const greenGradientStyle = {
        background: 'linear-gradient(to right, #009F00 0%, #035903 100%)',
    };

    return (
        <div className="min-h-screen flex">
            {/* Divisão à esquerda (70% - Logo e Texto) */}
            <div className="hidden lg:flex w-7/12 items-center justify-center p-12 relative overflow-hidden" style={greenGradientStyle}>
                <div className="z-10 text-center">
                    <img src={EconomizaSulLogo} alt="Logo Economiza Sul" className="w-64 mx-auto mb-6 drop-shadow-lg" />
                    <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">
                        Bem-vindo ao CRM
                    </h1>
                    <p className="text-xl text-green-100 drop-shadow-sm">
                        Sistema Exclusivo de Gerenciamento de Clientes
                    </p>
                </div>
            </div>

            {/* Divisão à direita (30% - Formulário de Login) */}
            <div className="w-full lg:w-5/12 flex items-center justify-center p-8 bg-white">
                <div className="max-w-md w-full">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Acesso ao Sistema
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Entre com suas credenciais
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        
                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="text-sm font-medium text-red-600 text-center p-2 bg-red-50 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Botão de Entrar */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={orangeGradientStyle}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white shadow-lg transition duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
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

                    {/* O LINK PARA CADASTRO FOI REMOVIDO CONFORME SOLICITADO */}
                </div>
            </div>
        </div>
    );
};

export default Login;