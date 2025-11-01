// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard'; 
// Supondo que você use um DatePicker component para as datas (não incluído)
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css'; 

const ReportsPage = () => {
    const { user } = useAuth();
    
    // 1. ESTADO DOS FILTROS
    const [vendedores, setVendedores] = useState([]);
    const [vendedorId, setVendedorId] = useState(user?.relatorios_proprios_only ? user.id : '');
    
    // CORREÇÃO CRÍTICA: Armazenar datas como strings YYYY-MM-DD
    const [startDate, setStartDate] = useState(''); // Data Inicial (String)
    const [endDate, setEndDate] = useState('');     // Data Final (String)
    
    const [originFilter, setOriginFilter] = useState(''); 
    const [availableOrigins, setAvailableOrigins] = useState([]); 

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

        // CORREÇÃO: Usar as strings de data diretamente
        const params = {
            ownerId: vendedorId,
            startDate: startDate || null, // Se for string vazia, envia null
            endDate: endDate || null,     // Se for string vazia, envia null
            origin: originFilter
        };

        try {
            const res = await axios.get('/api/reports/dashboard-data', { params });
            setDashboardData(res.data);
        } catch (err) {
            console.error("Erro ao buscar dados do Dashboard:", err);
            
            // Sugestão de Debug: Se for 401, o erro é de autenticação
            const errorMessage = err.response?.status === 401 
                ? "Sessão expirada ou não autorizado. Faça login novamente." 
                : "Não foi possível carregar os dados. Verifique a conexão do servidor.";
                
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
    
    
    // Função de Exportação (mantida)
    const handleExport = async (format) => {
        // Formatos: 'csv' ou 'pdf'
        const params = { 
            format,
            ownerId: vendedorId,
            // CORREÇÃO: Usar strings de data diretamente
            startDate: startDate || null, 
            endDate: endDate || null,     
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
                {/* Filtros de Período */}
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Início:</label>
                    <input 
                        type="date" 
                        // CORREÇÃO: Usar a string diretamente do estado
                        value={startDate} 
                        // CORREÇÃO: Armazenar a string diretamente
                        onChange={e => setStartDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium text-gray-700">Fim:</label>
                    <input 
                        type="date" 
                        // CORREÇÃO: Usar a string diretamente do estado
                        value={endDate}
                        // CORREÇÃO: Armazenar a string diretamente
                        onChange={e => setEndDate(e.target.value)}
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
                {/* 1. Mensagens de estado */}
                {loading && <p className="text-center text-blue-500">Carregando dados...</p>}
                {error && <p className="text-center text-red-500 font-medium">{error}</p>}
                
                {/* 2. Dashboard - Se não estiver carregando E não houver erro E houver dados, renderiza o componente. */}
                {!loading && !error && dashboardData && (
                    <ReportsDashboard 
                        data={dashboardData}
                        // Você pode passar a função de exportação aqui se quiser colocá-la dentro do dashboard
                    />
                )}
                
                {/* DEBUG: Se o carregamento terminou, não houve erro, mas os dados estão nulos (API retornou 200 com array vazio) */}
                {!loading && !error && !dashboardData && (
                    <div className="text-center p-10 font-medium text-gray-500">
                        Nenhum dado encontrado para os filtros selecionados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;