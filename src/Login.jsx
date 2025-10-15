import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Se você está usando 'fetch' nativo, esta linha está OK e não precisa de axios.

// URL DO BACKEND CORRIGIDA
// ATENÇÃO: Corrigi 'cnf7' para 'cnr7' (o correto) e usei a URL de produção.
const API_BASE_URL = 'https://crm-app-cnf7.onrender.com/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('Tentando login...');

        try {
            // Chamada com o URL:
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Salva o token e o userId no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                
                setMessage('Login realizado com sucesso! Redirecionando...');
                
                // Redireciona para o dashboard
                navigate('/dashboard', { replace: true }); // Adicionei { replace: true } para evitar voltar
            } else {
                const errorData = await response.json();
                setMessage(`Falha no login: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro de rede ou na requisição:', error);
            setMessage('Falha ao conectar ao servidor. Verifique a URL e a atividade do backend.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl space-y-6">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                    Acessar CRM
                </h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    >
                        Entrar
                    </button>
                </form>
                
                {message && (
                    <div className={`p-3 rounded-md text-sm text-center ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
                
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Crie uma aqui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;