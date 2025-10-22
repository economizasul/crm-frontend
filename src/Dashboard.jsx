// src/Dashboard.jsx - CÓDIGO CORRIGIDO PARA LISTAGEM E BUSCA DE LEADS

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx'; 

// Variável de ambiente para URL da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

const Dashboard = () => {
    // Renomeei para allLeads para refletir que são todos os leads
    const [allLeads, setAllLeads] = useState([]); 
    const [filteredLeads, setFilteredLeads] = useState([]); // Leads exibidos após a busca
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const navigate = useNavigate(); 
    const { token, isAuthenticated, logout } = useAuth(); 

    // --- LÓGICA DE BUSCA DA API ---
    const fetchLeads = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);
        
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            };
            // Usa a rota getAllLeads (já corrigida no leadController)
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, config);
            
            setAllLeads(response.data);
            setFilteredLeads(response.data); // Inicialmente, exibe todos
            setApiError(null);

        } catch (error) {
            console.error('Erro ao buscar leads:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                logout(); 
                setApiError('Sessão expirada. Faça login novamente.');
            } else {
                setApiError('Falha ao carregar leads. Verifique a conexão com a API.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // --- LÓGICA DE FILTRO (Busca) no FRONTEND ---
    const handleSearch = (term) => {
        setSearchTerm(term);
        const lowerCaseTerm = term.toLowerCase();

        if (!lowerCaseTerm.trim()) {
            setFilteredLeads(allLeads);
            return;
        }

        const results = allLeads.filter(lead => {
            // Mapeia os campos que serão buscados
            const matchName = lead.name?.toLowerCase().includes(lowerCaseTerm);
            const matchPhone = lead.phone?.includes(term); // Busca exata por telefone
            const matchDocument = lead.document?.includes(term);
            const matchEmail = lead.email?.toLowerCase().includes(lowerCaseTerm);
            const matchStatus = lead.status?.toLowerCase().includes(lowerCaseTerm);
            
            // Inclui campos do metadata
            const matchUC = lead.uc?.includes(term);
            const matchOrigin = lead.origin?.toLowerCase().includes(lowerCaseTerm);
            
            return matchName || matchPhone || matchDocument || matchEmail || matchStatus || matchUC || matchOrigin;
        });
        
        setFilteredLeads(results);
    };


    // --- LÓGICA DE RENDERIZAÇÃO ---
    
    if (isLoading) {
        return <div className="p-6 text-center text-indigo-600">Carregando Leads...</div>;
    }

    if (apiError) {
        return <div className="p-6 text-center text-red-600 font-bold">Erro: {apiError}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">Lista Completa de Leads</h1>
                <button 
                    onClick={() => navigate('/leads/cadastro')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                    <FaPlus size={14} />
                    <span>Novo Lead</span>
                </button>
            </div>
            
            {/* Campo de Busca */}
            <div className="mb-6 relative max-w-lg">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por Nome, Telefone, Documento, UC ou Status..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            {/* Tabela/Lista de Leads */}
            <div className="bg-white p-4 rounded-lg shadow-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <tr key={lead._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.uc || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'Fechado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.origin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => navigate(`/leads/${lead._id}`)} // Assumindo uma rota para detalhe/edição
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    {searchTerm.trim() ? "Nenhum lead encontrado com o termo de busca." : "Nenhum lead cadastrado ou encontrado."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Exibe o número total de leads encontrados */}
            <div className="mt-4 text-sm text-gray-600">
                Total de Leads: {filteredLeads.length} de {allLeads.length}
            </div>

        </div>
    );
};

export default Dashboard;