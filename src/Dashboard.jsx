import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Necessário para fetch com token
import { MapPin, Users, Zap, Menu, Plus, Phone, Landmark, DollarSign, Loader2, Search } from 'lucide-react';
import Sidebar from './components/Sidebar'; 

//Mantendo a URL de ambiente configurada no Render
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_LEADS = `${API_BASE_URL}/api/leads`;

// Mapeamento de Status para cores de Tailwind
const STATUS_COLORS = {
    'Para Contatar': 'bg-red-100 text-red-800 ring-red-300',
    'Em Contato': 'bg-yellow-100 text-yellow-800 ring-yellow-300',
    'Proposta Enviada': 'bg-blue-100 text-blue-800 ring-blue-300',
    'Fechado': 'bg-green-100 text-green-800 ring-green-300',
    'Perdido': 'bg-gray-100 text-gray-800 ring-gray-300',
};

// Componente Card de Lead (Melhorado e Moderno)
const LeadCard = ({ lead, navigate }) => {
    const statusClass = STATUS_COLORS[lead.status] || 'bg-gray-200 text-gray-800 ring-gray-400';

    return (
        // O Card agora é mais limpo, com borda sutil e sombra suave
        <div 
            // TODO: Adicionar lógica de navegação para a página de detalhes do Lead
            // onClick={() => navigate(`/leads/${lead._id}`)} 
            className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.01] cursor-pointer border border-gray-100"
        >
            <div className="flex justify-between items-start mb-3">
                {/* Nome do Lead - Grande e em destaque */}
                <h3 className="text-xl font-bold text-gray-900 truncate">
                    {lead.name}
                </h3>
                {/* Status - Como um badge estilizado */}
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusClass}`}>
                    {lead.status}
                </span>
            </div>

            {/* Informações Principais em duas colunas */}
            <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center space-x-2">
                    <Phone size={16} className="text-indigo-500" />
                    <span className="font-medium">Telefone:</span>
                    <span>{lead.phone || 'Não informado'}</span>
                </p>
                
                <p className="flex items-center space-x-2">
                    <MapPin size={16} className="text-indigo-500" />
                    <span className="font-medium">Endereço:</span>
                    <span className="truncate">{lead.address || 'Pendente'}</span>
                </p>

                <p className="flex items-center space-x-2">
                    <Landmark size={16} className="text-indigo-500" />
                    <span className="font-medium">UC:</span>
                    <span>{lead.uc || 'Não informada'}</span>
                </p>
                
                <p className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-indigo-500" />
                    <span className="font-medium">Consumo Médio:</span>
                    {/* Formatação para Moeda (opcional: instalar uma lib como 'numeral') */}
                    <span>{lead.avgConsumption ? `${lead.avgConsumption} kWh` : 'N/A'}</span>
                </p>
            </div>
        </div>
    );
};


const Dashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mantido para funcionalidade mobile
    
    // Estado para filtros e busca (simplificado)
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');

    // Função de Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login', { replace: true });
    };

    // Lógica de Fetch de Leads
    useEffect(() => {
        if (!token) {
            handleLogout(); 
            return;
        }

        const fetchLeads = async () => {
            setLoading(true);
            try {
                // Requisição GET usando axios
                const response = await axios.get(API_URL_LEADS, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.data && Array.isArray(response.data)) {
                    setLeads(response.data);
                } else {
                    setError('A resposta da API não é um array de Leads.');
                    setLeads([]);
                }
            } catch (err) {
                console.error('Erro ao buscar Leads:', err);
                setError('Falha ao carregar leads. Sua sessão pode ter expirado.');
                if (err.response && err.response.status === 401) {
                    handleLogout(); // Força o logout se o token for inválido
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [token, navigate]);

    // Lógica de Filtragem (Client-side, por enquanto)
    const filteredLeads = leads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Manteremos o visual dela em um passo futuro) */}
            <Sidebar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Overlay para Mobile (Melhora a usabilidade) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Header Fixo e Moderno */}
                <header className="bg-white shadow-md sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-extrabold text-indigo-800 flex items-center space-x-3">
                                <Zap size={28} className="text-yellow-500" />
                                <span>Dashboard de Leads</span>
                            </h1>

                            {/* Campo de Busca Otimizado */}
                            <div className="relative flex items-center w-full max-w-sm ml-4">
                                <input
                                    type="text"
                                    placeholder="Buscar leads por nome, telefone ou endereço..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                                <Search size={20} className="absolute left-3 text-gray-400" />
                            </div>

                            {/* Botão de Menu Mobile */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden text-gray-500 hover:text-indigo-600 transition duration-150"
                                title="Abrir Menu"
                            >
                                <Menu size={28} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    
                    {/* Indicadores de Status (Opcional - Pode ser adicionado no futuro) */}
                    <div className="mb-8">
                        {/* Aqui poderiam ir cards com Total de Leads, Leads Fechados, etc. */}
                        {/* Por enquanto, mantemos limpo. */}
                    </div>


                    {/* Área de Leads */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                            <span className="ml-3 text-lg text-gray-600">Carregando Leads...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center p-10 bg-red-100 text-red-700 rounded-lg border-red-300 border">
                            <p className="font-semibold">Erro ao Carregar:</p>
                            <p>{error}</p>
                            <button onClick={handleLogout} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                                Tentar Novo Login
                            </button>
                        </div>
                    ) : filteredLeads.length > 0 ? (
                        // Grid de Leads - Mais responsivo e espaçado
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredLeads.map((lead) => (
                                <LeadCard key={lead._id} lead={lead} navigate={navigate} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-16 bg-white rounded-xl shadow-lg text-gray-500 border border-dashed border-gray-300">
                            <p className="text-xl font-semibold mb-3">Nenhum Lead Encontrado</p>
                            <p>Ajuste os filtros de busca ou clique no botão "+" para adicionar um novo lead.</p>
                        </div>
                    )}
                </main>
            </div>
            
            {/* Botão Flutuante de Adicionar Novo Lead (Estilo Aprimorado) */}
            <button 
                onClick={() => navigate('/leads/cadastro')}
                className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition duration-300 z-40 flex items-center justify-center transform hover:scale-105"
                title="Adicionar Novo Lead"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Dashboard;