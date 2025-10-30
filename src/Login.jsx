// src/Login.jsx 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa'; 

// LOGO
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

            // CORREÇÃO: PASSA TODOS OS CAMPOS DO JWT
            const userData = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                relatorios_proprios_only: response.data.relatorios_proprios_only ?? true,
                relatorios_todos: response.data.relatorios_todos ?? false,
                transferencia_leads: response.data.transferencia_leads ?? false,
                acesso_configuracoes: response.data.acesso_configuracoes ?? false
            };

            login(response.data.token, userData); 
            navigate('/dashboard', { replace: true });

        } catch (err) {
            console.error('Erro de Login:', err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Falha ao conectar. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    const orangeGradientStyle = {
        background: 'radial-gradient(circle, #f0a96aff 0%, #F98828 30%, #935018 100%)',
    };
    
    const greenGradientStyle = {
        background: 'linear-gradient(to right, #009F00 0%, #035903 100%)',
    };

    return (
        <div className="min-h-screen flex bg-gray-100"> 
            <div className="hidden md:flex flex-col justify-center items-center w-full md:w-[70%] p-12 shadow-2xl" style={orangeGradientStyle}>
                <img src={EconomizaSulLogo} alt="Logo Economiza Sul" className="h-96 w-auto p-4" />
            </div>
            
            <div className="flex flex-col justify-center items-center w-full md:w-[30%] p-8 md:p-12 shadow-2xl" style={greenGradientStyle}> 
                <div className="w-full max-w-xs bg-white p-8 rounded-xl shadow-2xl"> 
                    <div className="text-center mb-8">
                        <div className="md:hidden mb-4">
                            <img src={EconomizaSulLogo} alt="Logo Economiza Sul" className="h-10 w-auto mx-auto" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Fazer Login</h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> 
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    placeholder="Seu Email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    placeholder="Sua Senha"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center p-3 bg-red-100 border border-red-300 rounded-lg" role="alert">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150"
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
                </div>
            </div>
        </div>
    );
};

export default Login;