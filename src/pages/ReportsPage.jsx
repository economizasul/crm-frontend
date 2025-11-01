// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
// IMPORTANTE: Mudar de 'axios' para a instância configurada 'api'
import api from '../services/api'; 
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard'; 

const ReportsPage = () => {
    const { user } = useAuth();
    
    // 1. ESTADO DOS FILTROS
    const [vendedores, setVendedores] = useState([]);
    const [vendedorId, setVendedorId] = useState(user?.relatorios_proprios_only ? user.id : '');
    
    // Armazenar datas como strings YYYY-MM-DD
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState('');     
    
    const [originFilter, setOriginFilter] = useState(''); 
    const [availableOrigins, setAvailableOrigins] = useState([]); 

    // 2. ESTADO DOS DADOS E CARREGAMENTO
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para buscar a lista de vendedores e origens (CORRIGIDA para usar 'api')
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                // Rota para vendedores
                const sellersRes = await api.get('/reports/sellers'); // <<< CORREÇÃO: Usando 'api'
                setVendedores(sellersRes.data);
                
                // Simulação da busca de Origens
                // 💡 Nota: Você deve ter um endpoint real para buscar as origens únicas dos leads.
                setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Parceria']);
                
            } catch (err) {
                console.error("Erro ao buscar filtros:", err);
            }
        };
        fetchFilters();
        // Definir o vendedorId inicial com base no usuário logado após carregar.
        if (!vendedorId && user?.relatorios_proprios_only) {
            setVendedorId(user.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Depende apenas do objeto user

    // Função principal de busca de dados do Dashboard (CORRIGIDA para usar 'api')
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = {
            ownerId: vendedorId,
            startDate: startDate || null, 
            endDate: endDate || null,     
            origin: originFilter
        };

        try {
            const res = await api.get('/reports/dashboard-data', { params }); // <<< CORREÇÃO: Usando 'api'
            setDashboardData(res.data);
            
            // Tratamento de dados vazios, caso o backend retorne 200 com array vazio
            if (!res.data || Object.keys(res.data).length === 0 || res.data.newLeads === 0) {
                 setError("Nenhum dado encontrado para os filtros selecionados.");
            } else {
                 setError(null);
            }
            
        } catch (err) {
            console.error("Erro ao buscar dados do Dashboard:", err.response || err);
            
            const status = err.response?.status;
            let errorMessage = "Não foi possível carregar os dados. Verifique a conexão do servidor.";
            
            if (status === 401 || status === 403) {
                 errorMessage = "Sessão expirada ou não autorizado. Faça login novamente.";
            } else if (status === 404) {
                 errorMessage = "A rota da API '/api/reports/dashboard-data' não foi encontrada. Verifique o servidor.";
            } else if (status === 500) {
                 errorMessage = "Erro interno do servidor (500). Verifique os logs do seu backend!";
            }
                
            setError(errorMessage);
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    }, [vendedorId, startDate, endDate, originFilter]);
    
    // 3. EFEITO PARA BUSCAR DADOS AO MUDAR OS FILTROS
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    
    // Função de Exportação (CORRIGIDA para usar 'api')
    const handleExport = async (format) => {
        const params = { 
            format,
            ownerId: vendedorId,
            startDate: startDate || null, 
            endDate: endDate || null,     
        };
        
        try {
            const response = await api.get('/reports/export', { // <<< CORREÇÃO: Usando 'api'
                params,
                responseType: 'blob' 
            });

            // Se o backend retornar 204 (No Content), não há dados para baixar
            if (response.status === 204) {
                return alert("Nenhum dado encontrado para exportação com os filtros atuais.");
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_${format}_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(`Erro ao exportar ${format}:`, err);
            alert(`Erro ao exportar relatório em ${format}. Verifique o console para detalhes.`);
        }
    };


    // 4. ESTRUTURA JSX
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Performance</h1>
                
                {/* Botões de Exportação */}
                <div className="relative inline-block text-left">
                    <button
                        onClick={() => handleExport('csv')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow mr-2 transition duration-150"
                    >
                        Exportar Dados (CSV)
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150"
                    >
                        Gerar Relatório (PDF)
                    </button>
                </div>
            </header>

            {/* FILTROS AVANÇADOS */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
                {/* Filtros de Período */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Início:</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Fim:</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Filtro de Vendedor */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Vendedor:</label>
                    {user?.relatorios_proprios_only ? (
                        <input
                            type="text"
                            value={user.name}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border rounded bg-gray-100"
                        />
                    ) : (
                        <select
                            value={vendedorId}
                            onChange={e => setVendedorId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Todos</option>
                            {vendedores.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                
                {/* Filtro: Origem do Lead */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Origem do Lead:</label>
                    <select
                        value={originFilter}
                        onChange={e => setOriginFilter(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Todas as Origens</option>
                        {availableOrigins.map(origin => (
                            <option key={origin} value={origin}>{origin}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Conteúdo do Dashboard */}
            <div className="mt-6">
                
                {/* Mensagens de estado */}
                {loading && <p className="text-center text-blue-500">Carregando dados...</p>}
                
                {/* Exibe erro se houver, mesmo que a mensagem de carregamento tenha passado */}
                {!loading && error && <p className="text-center text-red-500 font-medium">{error}</p>}
                
                {/* Dashboard - Renderiza se não estiver carregando E houver dados */}
                {!loading && dashboardData && !error && (
                    <ReportsDashboard 
                        data={dashboardData}
                    />
                )}
            </div>
        </div>
    );
};

export default ReportsPage;