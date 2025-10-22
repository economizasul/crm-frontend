import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KanbanBoard from './KanbanBoard';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const { token } = useAuth(); // Obtém o token do contexto de autenticação

    useEffect(() => {
        console.log('Debug - Token recebido:', token); // Log detalhado do token
        const fetchLeads = async () => {
            if (!token) {
                console.error('Erro: Token não encontrado. Faça login novamente.');
                return;
            }
            try {
                const response = await axios.get('https://crm-app-cnf7.onrender.com/api/v1/leads', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Adiciona o token para autenticação
                    },
                });
                console.log('Resposta da API:', response.data); // Log da resposta completa
                if (Array.isArray(response.data)) {
                    setLeads(response.data);
                } else {
                    console.error('Erro: Resposta da API não é um array:', response.data);
                    setLeads([]);
                }
            } catch (error) {
                console.error('Erro ao carregar leads:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                });
                setLeads([]); // Garante que o estado seja redefinido em caso de erro
            }
        };
        fetchLeads();
    }, [token]); // Adiciona token como dependência para recarregar se o token mudar

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4">
                <KanbanBoard leads={leads} />
            </main>
        </div>
    );
};

export default Dashboard;