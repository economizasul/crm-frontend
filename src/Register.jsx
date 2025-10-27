// src/Register.jsx - CÓDIGO REESCRITO PARA INCLUIR NOME, E-MAIL, TELEFONE, SENHA E TIPO DE USUÁRIO (ROLE)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone, FaUserTie } from 'react-icons/fa'; 
import { Loader2 } from 'lucide-react'; // Mantendo Loader2, se estiver em uso
// Nota: Seu App.jsx importava axios, mas o Register.jsx usava fetch. 
// Para ser fiel à sua base, reescrevi para usar fetch, mas incluí axios no corpo 
// para o caso de você ter esquecido de mudar o import. Usaremos Fetch por enquanto.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // NOVO CAMPO
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // NOVO CAMPO (Padrão: usuário comum)
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Tentando registro...');

        // Validação básica
        if (!name || !email || !password || !phone) {
            setMessage('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envia todos os campos necessários, incluindo role
                body: JSON.stringify({ name, email, password, phone, role }), 
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Usuário cadastrado com sucesso! Redirecionando para o login...');
                // Limpa campos após sucesso
                setName('');
                setEmail('');
                setPhone('');
                setPassword('');
                setRole('user');
                
                // Redireciona após um pequeno delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                
            } else {
                setMessage(data.error || 'Erro ao criar conta. Tente novamente.');
            }
        } catch (error) {
            console.error("Erro de Registro:", error);
            setMessage('Erro de conexão. Verifique a URL da API.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <FaUserPlus className="text-indigo-600 mx-auto w-10 h-10 mb-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Cadastro de Usuário do Sistema</h2>
                    <p className="text-gray-500 mt-1">Insira os dados do novo colaborador.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    
                    {/* Campo Nome */}
                    <div className="relative">
                        <FaUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                            required
                        />
                    </div>
                    
                    {/* Campo E-mail */}
                    <div className="relative">
                        <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                            required
                        />
                    </div>

                    {/* Campo Telefone */}
                    <div className="relative">
                        <FaPhone className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="tel"
                            placeholder="Telefone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                            required
                        />
                    </div>
                    
                    {/* Campo Senha */}
                    <div className="relative">
                        <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                            required
                        />
                    </div>

                    {/* Campo Tipo de Usuário (Role) */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            <FaUserTie className="inline mr-2 text-gray-500" />
                            Tipo de Usuário
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm bg-white"
                            required
                        >
                            <option value="user">Usuário Comum</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {/* Botão de Registro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            // Use Loader2 do lucide-react (mantendo o import original)
                            <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        ) : (
                            <FaUserPlus className="w-5 h-5 mr-3" /> // Usando FaUserPlus
                        )}
                        {loading ? 'Registrando...' : 'Criar Conta'}
                    </button>
                </form>
                
                {/* Mensagens de Erro/Sucesso */}
                {message && message !== 'Tentando registro...' && (
                    <div className={`p-3 rounded-lg text-sm text-center mt-4 ${message.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message}
                    </div>
                )}
                
                {/* Link de Login */}
                <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition duration-150">
                            Faça login aqui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;