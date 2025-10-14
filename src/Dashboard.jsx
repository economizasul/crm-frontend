import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Zap, Menu, Plus } from 'lucide-react';

// URL DO BACKEND - JÁ CORRIGIDA E FUNCIONAL
const API_BASE_URL = 'https://crm-app-cnf7.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Obter dados do usuário logado (token e userId)
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Assumindo que o userId é útil

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchLeads = async () => {
            setLoading(true);
            try {
                // NOTA: Precisamos criar esta rota no Backend: GET /api/v1/leads/vendedor/:userId
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
                    // Token expirado ou inválido
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    if (loading) return <div className="text-center p-8 text-indigo-600">Carregando Leads...</div>;
    if (error) return <div className="text-center p-8 text-red-600">Erro: {error}. <button onClick={handleLogout} className="text-sm underline ml-2">Sair</button></div>;
    
    // --- Renderização da Interface (Baseada na imagem do My Maps/Sugestão) ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            
            {/* Header (Topo fixo) */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="text-2xl font-bold text-indigo-700 flex items-center">
                    <Zap className="mr-2 text-yellow-500" size={24} />
                    GEOCRM
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
                    <button className="text-gray-600 hover:text-indigo-600 transition duration-150">
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Alertas e Prioridades (Inspirado na segunda tela) */}
            <div className="p-4 bg-red-100 text-red-700 font-semibold text-center sticky top-16 z-10 shadow-lg">
                <span className="flex items-center justify-center">
                    <MapPin className="mr-2" size={20}/>
                    3 RECHAMES VENCIDOS!
                </span>
            </div>

            {/* Conteúdo Principal (Lista de Leads) */}
            <main className="flex-grow p-4 md:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Leads para Contatar ({leads.length})
                </h3>
                
                {/* Botão Flutuante de Adicionar Novo Lead */}
                <button 
                    onClick={() => console.log('Abrir modal de Novo Lead')}
                    className="fixed bottom-20 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition duration-300 z-20 flex items-center justify-center"
                    title="Adicionar Novo Lead"
                >
                    <Plus size={28} />
                </button>


                {/* Seção da Lista de Leads */}
                <div className="space-y-3">
                    {leads.length > 0 ? (
                        leads.map((lead) => (
                            <div 
                                key={lead._id}
                                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition duration-200 cursor-pointer"
                                onClick={() => console.log(`Abrir detalhes do Lead: ${lead.name}`)}
                            >
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

            {/* Navegação Fixo (Rodapé/Mobile Menu) */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-2 flex justify-around sm:hidden z-10">
                <button className="flex flex-col items-center text-indigo-600">
                    <Zap size={24} />
                    <span className="text-xs">Prioridades</span>
                </button>
                <button className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
                    <MapPin size={24} />
                    <span className="text-xs">Mapa</span>
                </button>
                <button className="flex flex-col items-center text-gray-500 hover:text-indigo-600">
                    <Users size={24} />
                    <span className="text-xs">Clientes</span>
                </button>
            </footer>

        </div>
    );
};

export default Dashboard;
