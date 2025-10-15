import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Ícones Lucide-React
import { MapPin, Users, Menu, Plus, Search, Loader2 } from 'lucide-react'; 
// Componentes
import Sidebar from './Sidebar.jsx'; // Caminho corrigido para o arquivo principal
import LeadCard from './components/LeadCard'; // **NOVO COMPONENTE: LeadCard.jsx**

// URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// Componente para exibir o Status com estilo de badge
const StatusBadge = ({ status }) => {
    let classes = "text-xs font-semibold px-2.5 py-0.5 rounded-full";
    if (status === 'Fechado') classes += " bg-green-100 text-green-800";
    else if (status === 'Em Negociação') classes += " bg-yellow-100 text-yellow-800";
    else if (status === 'Para Contatar') classes += " bg-red-100 text-red-800";
    else classes += " bg-gray-100 text-gray-800";
    
    return <span className={classes}>{status}</span>;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Estado de controle para o menu mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

    const token = localStorage.getItem('token');
    // const userId = localStorage.getItem('userId'); // Mantive o userId, mas não é usado na lógica de fetch atual

    // 1. Função de Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login', { replace: true });
    };

    // 2. Lógica de Fetch de Leads
    useEffect(() => {
        if (!token) {
            handleLogout(); 
            return;
        }

        const fetchLeads = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/leads`, {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    },
                });

                if (!response.ok) {
                    // Se o token expirou (401), desloga
                    if (response.status === 401) handleLogout();
                    throw new Error(`Erro ao buscar leads: ${response.statusText}`);
                }

                const data = await response.json();
                setLeads(data);

            } catch (err) {
                console.error("Erro no fetch de leads:", err);
                setError("Falha ao carregar os dados. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [token, navigate]); // Dependências

    // 3. Filtragem de Leads (Visual - Sem API)
    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.address && lead.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 1. Sidebar (Componente separado) */}
            <Sidebar 
                handleLogout={handleLogout} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />

            {/* 2. Área de Conteúdo Principal */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                
                {/* 2.1. Header Fixo e Moderno */}
                <header className="sticky top-0 z-30 bg-white shadow-lg p-4 flex items-center justify-between border-b border-gray-200">
                    
                    {/* Menu Mobile Button e Título */}
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-600 p-2 rounded-full hover:bg-gray-100 md:hidden transition"
                            aria-label="Abrir Menu"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-800 ml-3 hidden sm:block">
                            Dashboard de Leads
                        </h1>
                    </div>
                    
                    {/* Campo de Busca (Destaque) */}
                    <div className="relative w-full max-w-sm md:max-w-md">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar leads por nome, endereço ou status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    
                    {/* Espaço para futuras notificações/perfil */}
                    <div className="hidden sm:block w-10"></div>
                </header>

                {/* 2.2. Main Content Area */}
                <main className="p-4 sm:p-6 flex-1">
                    {/* Mensagens de Estado */}
                    {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
                            <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mr-2" />
                            <span className="text-lg text-indigo-500">Carregando Leads...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <div 
                                        key={lead.id} 
                                        // Usando classes de card limpas e elegantes
                                        className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-indigo-300 transform transition duration-300 cursor-pointer"
                                        onClick={() => navigate(`/leads/${lead.id}`)} // Assumindo rota de detalhes
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{lead.name}</h3>
                                            <StatusBadge status={lead.status} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <Users size={14} className="inline mr-2 text-indigo-500" /> 
                                                <span className="font-medium">UC:</span> {lead.uc || 'Não informada'}
                                            </p>
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <MapPin size={14} className="inline mr-2 text-indigo-500" /> 
                                                <span className="font-medium">Endereço:</span> {lead.address || 'Pendente'}
                                            </p>
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <span className="font-medium bg-gray-100 px-1 rounded">
                                                    {lead.origin || 'Website'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-500">
                                    <Zap size={32} className="mx-auto mb-3 text-indigo-400" />
                                    <h3 className="text-xl font-semibold">Sem Leads Encontrados</h3>
                                    <p className="mt-1">Ajuste o filtro de busca ou adicione um novo Lead.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
            
            {/* Botão Flutuante de Adicionar Novo Lead */}
            <button 
                onClick={() => navigate('/leads/cadastro')}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition duration-300 z-40 flex items-center justify-center"
                title="Adicionar Novo Lead"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Dashboard;