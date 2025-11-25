// src/pages/LeadSearch.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';
import { STAGES } from './KanbanBoard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-app-cnf7.onrender.com';

// --- Funções auxiliares ---
const formatNoteDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Sem Data';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Data Inválida';

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    } catch {
        return 'Erro de Formato';
    }
};

// --- Correção do switch: removida duplicação de “Primeiro Contato” ---
const statusColor = (status) => {
    switch (status) {
        case 'Novo':
            return 'bg-gray-100 text-gray-800';
        case 'Primeiro Contato':
            return 'bg-blue-100 text-blue-800';
        case 'Retorno Agendado':
            return 'bg-indigo-100 text-indigo-800';
        case 'Em Negociação':
            return 'bg-yellow-100 text-yellow-800';
        case 'Proposta Enviada':
            return 'bg-purple-100 text-purple-800';
        case 'Ganho':
            return 'bg-green-100 text-green-800';
        case 'Perdido':
            return 'bg-red-100 text-red-800';
        case 'Inapto':
            return 'bg-orange-100 text-red-800';            
        // Fallbacks legados
        case 'Fechado':
            return 'bg-green-100 text-green-800';
        case 'Em Conversação':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// --- Componente de Listagem e Busca ---
const LeadSearchContent = React.memo(
    ({ isLoading, apiError, navigate, searchTerm, handleSearchChange, filteredLeads, handleEdit }) => {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                    Busca e Listagem de Leads
                    <button
                        onClick={() => navigate('/register-lead')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                    >
                        <FaPlus /> <span>Novo Lead</span>
                    </button>
                </h1>

                <div className="mb-6 flex space-x-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Pesquisar por Nome, Telefone, Email, UC ou Documento..."
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {isLoading && <div className="text-center text-indigo-600 mt-10">Carregando leads...</div>}
                {apiError && <div className="text-center text-red-600 mt-10">{apiError}</div>}

                {!isLoading && !apiError && (
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Telefone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                                            {lead.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(
                                                    lead.status
                                                )}`}
                                            >
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(lead._id)}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                                            >
                                                <FaEdit size={14} /> <span>Editar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-4 text-center text-gray-500 italic"
                                        >
                                            {searchTerm
                                                ? `Nenhum lead encontrado com o termo "${searchTerm}".`
                                                : 'Nenhum lead cadastrado.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }
);

// --- Componente Principal ---
const LeadSearch = () => {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const { token, logout } = useAuth();

    const fetchLeads = useCallback(async () => {
        if (!token) {
            setApiError('Token de autenticação ausente. Redirecionando...');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        setIsLoading(true);
        setApiError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(response.data);
        } catch (err) {
            console.error('Erro ao buscar leads:', err.response?.data || err.message);
            setApiError('Falha ao carregar leads. Verifique a conexão com o servidor ou o token.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, navigate, logout]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleEdit = (leadId) => navigate(`/register-lead/${leadId}`);

    const filteredLeads = useMemo(() => {
        if (!searchTerm) return leads;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return leads.filter(
            (lead) =>
                lead.name?.toLowerCase().includes(lowerCaseSearch) ||
                lead.phone?.includes(searchTerm) ||
                lead.email?.toLowerCase().includes(lowerCaseSearch) ||
                lead.uc?.toLowerCase().includes(lowerCaseSearch) ||
                lead.document?.includes(searchTerm)
        );
    }, [leads, searchTerm]);

    return (
        <div className="flex-1">
            <LeadSearchContent
                isLoading={isLoading}
                apiError={apiError}
                navigate={navigate}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                filteredLeads={filteredLeads}
                handleEdit={handleEdit}
            />
        </div>
    );
};

export default LeadSearch;
