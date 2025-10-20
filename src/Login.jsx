import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
// Caminho de importação ajustado para a raiz do src/
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = 'https://crm-app-cnf7.onrender.com';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
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
                login(data.token, data.id || data.userId); // Usa o Contexto
                setMessage('Login realizado com sucesso! Redirecionando...');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl space-y-6">
                
                <div className="text-center">
                    <LogIn className="w-12 h-12 mx-auto text-indigo-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Acesse sua conta
                    </h2>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleLogin}>
                    
                    {/* Campo de Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    {/* Campo de Senha */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            required
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    {/* Botão de Login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        ) : (
                            <LogIn className="w-5 h-5 mr-3" />
                        )}
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                
                {/* Mensagens de Erro/Sucesso e Link de Cadastro */}
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