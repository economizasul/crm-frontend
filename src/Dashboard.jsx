import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Zap, Menu, Plus } from 'lucide-react';
import Sidebar from './components/Sidebar'; // Importa a nova Sidebar

// URL DO BACKEND - Garantir que o VITE_API_URL esteja sendo usado
// NOTA: No seu código anterior, você usou a constante API_BASE_URL. 
// No Login.jsx usamos import.meta.env.VITE_API_URL.
// Para consistência, vou usar a constante direto aqui, mas garanta que ela esteja correta.
const API_BASE_URL = 'https://crm-app-cnr7.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para mobile

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Função de Logout (Centralizada no Dashboard)
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login', { replace: true });
    };

    // Lógica de Fetch de Leads (Inalterada)
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchLeads = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/leads/vendedor/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setLeads(data);
                } else if (response.status === 401) {
                    navigate('/login');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha ao carregar leads.');
                }
            } catch (err) {
                console.error('Erro ao buscar leads:', err);
                setError(err.message || 'Erro ao conectar com a API de Leads.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [token, userId, navigate]);
    
    // Renderização de estado de carregamento/erro
    if (loading) return <div className="text-center p-8 text-indigo-600">Carregando Leads...</div>;
    if (error) return <div className="text-center p-8 text-red-600">Erro: {error}. <button onClick={handleLogout} className="text-sm underline ml-2">Sair</button></div>;


    // Estrutura Principal com Sidebar e Conteúdo
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 1. Sidebar (Desktop) */}
            <Sidebar handleLogout={handleLogout} />
            
            {/* 2. Mobile Sidebar Overlay (Abre/Fecha) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition duration-300 ease-in-out z-30 md:hidden`}>
                 <Sidebar handleLogout={handleLogout} />
            </div>

            {/* 3. Conteúdo Principal */}
            <div className="flex-1 flex flex-col md:ml-64"> 
                
                {/* 4. Navbar/Header (Topo) */}
                <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                    <button 
                        className="text-gray-600 hover:text-indigo-600 md:hidden" 
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <div className="text-2xl font-bold text-indigo-700 md:block hidden">
                        Dashboard
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                            Vendedor: {userId ? userId.substring(0, 8) + '...' : 'Desconhecido'}
                        </span>
                        <button 
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition duration-150 p-2 rounded-full hover:bg-red-50"
                            title="Sair (Logout)"
                        >
                            Sair
                        </button>
                    </div>
                </header>

                {/* 5. Alertas e Conteúdo da Página */}
                <main className="flex-grow p-4 md:p-6">
                    
                    {/* Alerta de Prioridades (mantido do seu código original) */}
                    <div className="mb-6 p-4 bg-red-100 text-red-700 font-semibold text-center shadow-lg rounded-xl">
                        <span className="flex items-center justify-center">
                            <MapPin className="mr-2" size={20}/>
                            3 RECHAMES VENCIDOS!
                        </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Leads para Contatar ({leads.length})
                    </h3>
                    
                    {/* Seção da Lista de Leads (mantida do seu código original) */}
                    <div className="space-y-3">
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <div 
                                    key={lead._id}
                                    className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition duration-200 cursor-pointer"
                                    onClick={() => console.log(`Abrir detalhes do Lead: ${lead.name}`)}
                                >
                                    {/* ... Conteúdo do Card de Lead ... */}
                                    <div className="flex justify-between items-start">
                                        <p className="text-lg font-bold text-gray-900">{lead.name}</p>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                             lead.status === 'Convertido' ? 'bg-green-100 text-green-800' :
                                             lead.status === 'Em negociação' ? 'bg-yellow-100 text-yellow-800' :
                                             'bg-blue-100 text-blue-800'
                                         }`}>
                                             {lead.status || 'Para Contatar'}
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
            
            {/* Botão Flutuante de Adicionar Novo Lead (mantido) */}
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