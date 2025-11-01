// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
// IMPORTANTE: Use a instância configurada 'api'
import api from '../services/api'; 
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard'; 

const ReportsPage = () => {
    const { user } = useAuth();
    
    // ... (ESTADOS MANTIDOS)
    const [vendedores, setVendedores] = useState([]);
    // Inicializa vendedorId com o ID do usuário se for relatórios próprios, senão com string vazia ("Todos")
    const [vendedorId, setVendedorId] = useState(user?.relatorios_proprios_only ? user.id : ''); 
    
    // Armazenar datas como strings YYYY-MM-DD
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState('');     
    
    const [originFilter, setOriginFilter] = useState(''); 
    const [availableOrigins, setAvailableOrigins] = useState([]); 

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para buscar a lista de vendedores e origens (CORRIGIDA para usar 'api')
    const fetchFilters = useCallback(async () => {
        try {
            // Rota para vendedores
            const sellersRes = await api.get('/reports/sellers'); 
            setVendedores(sellersRes.data);
            
            // Simulação da busca de Origens (MANTIDO)
            setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Parceria']);
            
        } catch (err) {
            console.error("Erro ao buscar filtros:", err.response || err);
            // Se o erro for 401 aqui, a tela fica travada, mas a api.js deve ter falhado
        }
    }, []);

    useEffect(() => {
        fetchFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // Função principal de busca de dados do Dashboard (CORRIGIDA para usar 'api')
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = {
            // O ownerId pode ser string vazia, que é tratada no backend (ownerId || undefined)
            ownerId: vendedorId, 
            startDate: startDate || null, 
            endDate: endDate || null,     
            origin: originFilter
        };

        try {
            const res = await api.get('/reports/dashboard-data', { params });
            
            // Verificação simples se o retorno é válido (não é array vazio, etc.)
            if (res.status === 204 || !res.data || Object.keys(res.data).length === 0 || res.data.newLeads === undefined) {
                 setDashboardData(null);
                 setError("Nenhum dado encontrado para os filtros selecionados.");
            } else {
                 setDashboardData(res.data);
                 setError(null);
            }
            
        } catch (err) {
            console.error("Erro ao buscar dados do Dashboard:", err.response || err);
            
            const status = err.response?.status;
            let errorMessage = "Erro na comunicação com o servidor. Verifique a rede.";
            
            // O status 401 é a causa do seu problema!
            if (status === 401 || status === 403) {
                 errorMessage = "Sessão expirada ou não autorizado. Faça login novamente.";
            } else if (status === 500) {
                 errorMessage = "Erro interno do servidor (500). Verifique os logs do seu backend!";
            } else if (status === 404) {
                 errorMessage = "A rota da API '/api/reports/dashboard-data' não foi encontrada. Verifique o servidor.";
            }
                
            setError(errorMessage);
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    }, [vendedorId, startDate, endDate, originFilter]);
    
    // Efeito para buscar dados ao mudar os filtros
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
            const response = await api.get('/reports/export', { 
                params,
                responseType: 'blob' 
            });

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


    // 4. ESTRUTURA JSX (Mantida)
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* ... (Header e Filtros mantidos) ... */}
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
                
                {/* Exibe erro se houver */}
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