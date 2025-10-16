import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from './KanbanBoard'; 

// ✅ CORREÇÃO: Usando a variável de ambiente padronizada para maior compatibilidade.
// O valor padrão ('https://crm-app-cnf7.onrender.com') foi mantido como fallback.
const API_BASE_URL = window.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
    
    // ✅ ESTADO: Controla qual fase (aba) está ativa.
    // 'contatar' é o ID da primeira fase (Para Contatar).
    const [activeStage, setActiveStage] = useState('contatar');

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
                // Endpoint para buscar todos os leads do usuário
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

    // O Dashboard passa todos os dados e estados para o KanbanBoard
    return (
        <KanbanBoard 
            leads={leads}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            // ✅ PROPS PASSADAS PARA O NOVO LAYOUT DE ABAS
            activeStage={activeStage}
            setActiveStage={setActiveStage}
        />
    );
};

export default Dashboard;
