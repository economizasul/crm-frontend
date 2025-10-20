import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = 'https://crm-app-cnf7.onrender.com';

function Login() {
    // ... (Hooks: email, password, message, loading, navigate)
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
        // O JSX do formulário de login (sem alterações)
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            {/* ... (Resto do seu JSX do Login) ... */}
        </div>
    );
}

export default Login;