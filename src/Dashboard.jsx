import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Importação correta:
import KanbanBoard from './KanbanBoard'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        // ESSA VERIFICAÇÃO É CRUCIAL PARA NÃO FICAR VAZIA
        if (!token) {
            handleLogout(); 
            return;
        }

        const fetchLeads = async () => {
            setLoading(true);
            try {
                // Se a URL da API não for acessível, o erro é pego
                const response = await fetch(`${API_BASE_URL}/api/leads`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 401) handleLogout();
                    throw new Error(`Erro ao buscar leads: ${response.statusText}`);
                }

                const data = await response.json();
                setLeads(data);
            } catch (err) {
                console.error("Erro no fetch de leads:", err);
                setError("Falha ao carregar os dados. Verifique a API. (Pode ser erro de CORS/Rede)");
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [token, navigate]);

    // O Dashboard agora só passa os dados e estados para o KanbanBoard
    // Se esta função for executada, a tela não fica vazia.
    return (
        <KanbanBoard 
            leads={leads}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            handleLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
        />
    );
};

export default Dashboard;