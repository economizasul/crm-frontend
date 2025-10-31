// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
// Importe o novo componente do dashboard (você o criará em seguida)
import ReportsDashboard from '../components/reports/ReportsDashboard'; 
// Supondo que você use um DatePicker component para as datas (não incluído)
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css'; 

const ReportsPage = () => {
    const { user } = useAuth();
    
    // 1. ESTADO DOS FILTROS
    const [vendedores, setVendedores] = useState([]);
    const [vendedorId, setVendedorId] = useState(user?.relatorios_proprios_only ? user.id : '');
    const [startDate, setStartDate] = useState(null); // Data Inicial
    const [endDate, setEndDate] = useState(null);     // Data Final
    const [originFilter, setOriginFilter] = useState(''); // NOVO FILTRO: Origem do Lead
    const [availableOrigins, setAvailableOrigins] = useState([]); // Opções de Origem

    // 2. ESTADO DOS DADOS E CARREGAMENTO
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para buscar a lista de vendedores (Mantida)
    useEffect(() => {
        // Busca a lista de vendedores e as origens disponíveis (simples)
        const fetchFilters = async () => {
            try {
                // Rota para vendedores (usando o users/sellers)
                const sellersRes = await axios.get('/api/reports/sellers');
                setVendedores(sellersRes.data);
                
                // 💡 NOVO: Você precisará de um endpoint para buscar as origens únicas dos Leads
                // Por agora, vou usar um valor mock para que o filtro apareça:
                setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Parceria']);
                
            } catch (err) {
                console.error("Erro ao buscar filtros:", err);
            }
        };
        fetchFilters();
    }, []);

    // Função principal de busca de dados do Dashboard
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = {
            ownerId: vendedorId,
            // Formate as datas para o padrão ISO que o backend espera (YYYY-MM-DD)
            startDate: startDate ? startDate.toISOString().split('T')[0] : null, 
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            origin: originFilter
        };

        try {
            // Chamada para o NOVO ENDPOINT que criamos no ReportController
            const res = await axios.get('/api/reports/dashboard-data', { params });
            setDashboardData(res.data);
        } catch (err) {
            console.error("Erro ao buscar dados do Dashboard:", err);
            setError("Não foi possível carregar os dados. Tente novamente.");
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    }, [vendedorId, startDate, endDate, originFilter]);
    
    // 3. EFEITO PARA BUSCAR DADOS AO MUDAR OS FILTROS
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    
    // Função de Exportação (passada para o Dashboard para ser usada nos botões)
    const handleExport = async (format) => {
        // Formatos: 'csv' ou 'pdf'
        const params = { 
            format,
            ownerId: vendedorId,
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            // Outros filtros, se necessário
        };
        
        try {
            const response = await axios.get('/api/reports/export', { 
                params,
                responseType: 'blob' // Importante para baixar arquivos
            });

            // Cria um link para download do arquivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_${format}_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(`Erro ao exportar ${format}:`, err);
            alert(`Erro ao exportar relatório em ${format}.`);
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
                {/* Filtros de Período (Usando inputs simples por falta do componente DatePicker) */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Início:</label>
                    <input 
                        type="date" 
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Fim:</label>
                    <input 
                        type="date" 
                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                        onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                {/* Filtro de Vendedor (Seu código original) */}
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
                                // Assumindo que a rota /sellers retorna id e name
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                
                {/* NOVO FILTRO: Origem do Lead */}
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
                {loading && <p className="text-center text-blue-500">Carregando dados...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                
                {/* Passa os dados para o componente do Dashboard */}
                {!loading && dashboardData && (
                    <ReportsDashboard 
                        data={dashboardData}
                        // Você pode passar a função de exportação aqui se quiser colocá-la dentro do dashboard
                    />
                )}
            </div>
        </div>
    );
};

export default ReportsPage;