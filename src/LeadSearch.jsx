import React, { useState, useCallback } from 'react';
import { FaSearch, FaBolt, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx'; // Necessário para manter o layout

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const LeadSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();

    // Função para buscar leads na API
    const handleSearch = useCallback(async (e) => {
        if (e) e.preventDefault();
        
        if (!isAuthenticated || !token) {
            setApiError('Sessão expirada. Por favor, faça login.');
            return;
        }

        if (searchTerm.trim().length < 3) {
            setApiError('Digite pelo menos 3 caracteres para buscar.');
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setApiError(null);
        
        try {
            // Usa o endpoint de leads e filtra no backend se possível.
            // Se o backend não suporta busca por query, você precisará buscar todos e filtrar no front-end,
            // mas é muito ineficiente. Assumo que o backend pode filtrar pelo menos por 'search'.
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads/search?q=${searchTerm}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            
            // Se o seu backend não tem um endpoint de busca, use este:
            // const allLeads = (await axios.get(`${API_BASE_URL}/api/v1/leads`, { headers: { 'Authorization': `Bearer ${token}` }})).data;
            // const filteredLeads = allLeads.filter(lead => 
            //     lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            //     lead.phone.includes(searchTerm)
            // );
            // setSearchResults(filteredLeads);
            
            setSearchResults(response.data);

        } catch (error) {
            console.error('Erro ao buscar leads:', error.response?.data || error.message);
            setApiError('Falha ao realizar a busca. Verifique a conexão com a API.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, token, isAuthenticated]);

    // Função que lida com o clique na linha para editar (redireciona para o LeadForm)
    const handleRowClick = (leadId) => {
        // Assume que o LeadForm.jsx está configurado para receber um ID para edição
        navigate(`/leads/cadastro/${leadId}`); 
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6"> 
                <h1 className="text-4xl font-extrabold text-indigo-800 mb-6">Buscar Lead</h1>

                <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <div className="flex items-center flex-1 bg-white p-2 rounded-xl shadow-md border border-gray-200">
                        <FaSearch className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Buscar por Nome, Telefone, CPF/CNPJ, UC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full focus:outline-none text-gray-700 placeholder-gray-400"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading || searchTerm.trim().length < 3}
                        className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
                    >
                        <FaSearch size={16} />
                        <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate('/leads/cadastro')}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition duration-200"
                    >
                        <FaUserPlus size={16} />
                        <span>Novo Lead</span>
                    </button>
                </form>

                {/* Área de Resultados e Erros */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {apiError && (
                        <div className="text-red-600 mb-4 p-3 border border-red-200 bg-red-50 rounded-lg">{apiError}</div>
                    )}

                    {isLoading && <p className="text-center text-indigo-600 py-8">Carregando resultados...</p>}
                    
                    {!isLoading && !apiError && searchResults.length === 0 && searchTerm.length >= 3 && (
                        <p className="text-center text-gray-500 py-8">Nenhum lead encontrado com o termo "{searchTerm}".</p>
                    )}
                    
                    {!isLoading && searchResults.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumo (kWh)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {searchResults.map((lead) => (
                                        <tr 
                                            key={lead._id} 
                                            onClick={() => handleRowClick(lead._id)}
                                            className="hover:bg-indigo-50 cursor-pointer transition duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.document || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">{lead.status || 'Para Contatar'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.avgConsumption || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LeadSearch;