import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react'; 
import { useAuth } from './AuthContext.jsx'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Obtém o usuário logado para extrair o token de autorização.
    const { user } = useAuth(); 

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Tentando trocar senha...');

        if (newPassword !== confirmNewPassword) {
            setMessage('A nova senha e a confirmação não coincidem.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) { 
            setMessage('A nova senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        try {
            // CRÍTICO: Endpoint de mudança de senha (ajuste conforme o seu backend)
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    // Envia o token do usuário logado (admin ou user)
                    'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    currentPassword, 
                    newPassword 
                }),
            });

            if (response.ok) {
                setMessage('Senha alterada com sucesso! Você será desconectado em breve.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                
            } else {
                const errorData = await response.json();
                setMessage(`Falha ao alterar senha: ${errorData.error || response.statusText}. Verifique se a senha atual está correta.`);
            }
        } catch (error) {
            console.error('Erro de Conexão:', error);
            setMessage('Erro de conexão com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-start justify-center min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-6">
                    <h2 className="mt-2 text-3xl font-extrabold text-indigo-900">
                        Trocar Senha
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Altere sua senha de acesso ao sistema
                    </p>
                </div>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm text-center ${message.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleChangePassword}>
                    
                    {/* Campo Senha Atual */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Senha Atual"
                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    {/* Campo Nova Senha */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nova Senha"
                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    {/* Campo Confirma Nova Senha */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Confirme a Nova Senha"
                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Botão de Troca de Senha */}
                    <button
                        type="submit"
                        disabled={loading || newPassword !== confirmNewPassword || !newPassword}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5 mr-3" />
                        ) : (
                            <Lock className="w-5 h-5 mr-3" />
                        )}
                        {loading ? 'Alterando...' : 'Confirmar Troca de Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;