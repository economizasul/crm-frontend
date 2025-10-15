import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Zap, Menu, Plus } from 'lucide-react';
import Sidebar from './components/Sidebar'; // O caminho './components/Sidebar' está correto

// Variável de ambiente VITE_API_URL (se definida no Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para mobile

    const token = localStorage.getItem('token');
    // const userId = localStorage.getItem('userId'); // Mantendo esta linha comentada, pois o token é o mais importante

    // Função de Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login', { replace: true });
    };

    // Lógica de Fetch de Leads
    useEffect(() => {
        if (!token) {
            handleLogout(); // Se não há token, desloga e redireciona
            return;
        }

        const fetchLeads = async () => {
            setLoading(true);
            try {
                // Chamada CORRIGIDA: Usa o prefixo do Backend /api/leads
                const response = await fetch(`${API_BASE_URL}/api/leads`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Envia o token de autenticação
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setLeads(data);
                    setError(null);
                } else if (response.status === 401) {
                    // Token expirado ou inválido
                    handleLogout();
                } else {
                    const errorData = await response.json();
                    setError(`Erro ao carregar leads: ${errorData.error || response.statusText}`);
                }
            } catch (err) {
                setError('Erro de rede ao buscar os leads.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [token, navigate]); 
    // ... (O restante do componente Dashboard continua sem alterações)
    // ...
    // (O restante do código que você enviou: JSX e outros elementos)
    // ...
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (desktop) */}
            <Sidebar handleLogout={handleLogout} />

            {/* Menu Mobile */}
            <div className="md:hidden p-4">
                <button onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
            </div>
            
            {/* Overlay e Sidebar Mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                    {/* Renderiza o Sidebar dentro do overlay para mobile */}
                    <div className="w-64 h-full bg-indigo-900 p-4" onClick={(e) => e.stopPropagation()}>
                        <Sidebar handleLogout={handleLogout} />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white shadow-md">
                    <h1 className="text-xl font-semibold text-gray-800">Dashboard de Leads</h1>
                    <button 
                        onClick={handleLogout}
                        className="md:hidden text-red-500 hover:text-red-700 transition duration-150"
                    >
                        Sair
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {loading && <div className="text-center p-10">Carregando Leads...</div>}
                    {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!loading && !error && leads.length > 0 ? (
                            leads.map((lead) => (
                                <div key={lead.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition duration-300 border-t-4 border-indigo-500">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-800">{lead.name}</h3>
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                                            {lead.status || 'Novo'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                         <Users size={14} className="inline mr-1" /> UC: {lead.uc || 'Não informada'}
                                     </p>
                                     <p className="text-sm text-gray-500">
                                         <MapPin size={14} className="inline mr-1" /> {lead.address || 'Endereço pendente'}
                                     </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-white rounded-lg shadow-inner text-gray-500">
                                Nenhum Lead encontrado. Clique em "+" para adicionar um novo.
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            {/* Botão Flutuante de Adicionar Novo Lead */}
            <button 
                onClick={() => navigate('/leads/cadastro')}
                className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition duration-300 z-40 flex items-center justify-center"
                title="Adicionar Novo Lead"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Dashboard;