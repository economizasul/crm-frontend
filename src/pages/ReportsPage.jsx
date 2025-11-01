// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
// IMPORTANTE: Usa a instância configurada com JWT
import api from '../services/api'; 
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard';

// Opcional: Se você usa um componente DatePicker, importe-o aqui.

const ReportsPage = () => {
  const { user } = useAuth();

  // 1. ESTADO DOS FILTROS
  const [vendedores, setVendedores] = useState([]);
  const [vendedorId, setVendedorId] = useState(
    // Aplica filtro próprio se a permissão estiver ativa no usuário
    user?.relatorios_proprios_only ? user.id : ''
  );
  // Armazenar datas como strings YYYY-MM-DD
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  // Lista de origens (pode ser hardcoded ou vir de outra API)
  const [availableOrigins, setAvailableOrigins] = useState([]);

  // 2. ESTADO DOS DADOS E CARREGAMENTO
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar a lista de vendedores (usuários ativos) e origens
  const fetchFilters = useCallback(async () => {
    try {
      // Rota para vendedores (usuários ativos)
      const sellersRes = await api.get('/reports/sellers');
      setVendedores(sellersRes.data);
      // HARDCODED: Lista de origens (ajuste conforme o seu sistema)
      setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Parceria']);
    } catch (err) {
      console.error('Erro ao buscar filtros:', err.response || err);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Função para buscar os dados do dashboard com base nos filtros
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ownerId: vendedorId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        origin: originFilter || undefined,
      };

      // Limpa os parâmetros 'undefined' para não serem enviados na URL (cleaner URL)
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v) // Remove valores vazios (null, '', undefined)
      );

      const response = await api.get('/reports/dashboard-data', {
        params: filteredParams,
      });

      // Se o backend retornar 204 (No Content), significa que não há dados
      if (response.status === 204) {
        setDashboardData(null);
        setError('Nenhum dado encontrado para os filtros selecionados.');
      } else {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      // Mensagem de erro mais amigável
      setError(err.response?.data?.error || 'Não foi possível carregar o dashboard.');
      setDashboardData(null); // Limpa dados antigos em caso de erro
    } finally {
      setLoading(false);
    }
  }, [vendedorId, startDate, endDate, originFilter]);

  // Efeito para buscar dados sempre que os filtros mudarem
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Função para Exportar (CSV/PDF)
  const handleExport = async (format) => {
    try {
      const params = {
        exportFormat: format, // 'csv' ou 'pdf'
        ownerId: vendedorId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        origin: originFilter || undefined,
      };
      
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v)
      );

      // Exportação é um GET no backend, com responseType: 'blob'
      const response = await api.get('/reports/export', {
        params: filteredParams,
        responseType: 'blob', 
      });

      // Cria um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Tenta extrair o nome do arquivo do cabeçalho
      const contentDisposition = response.headers['content-disposition'];
      let filename = `relatorio_leads.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
        if (filenameMatch && filenameMatch.length > 1) {
          // O filename vem URI encoded, o navegador costuma lidar com isso, mas pode precisar de decodeURIComponent
          filename = filenameMatch[1]; 
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Libera o recurso

    } catch (error) {
      console.error('Erro na exportação:', error.response?.data || error);
      alert('Erro ao gerar o arquivo de exportação. Verifique se há dados e tente novamente.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Relatórios e Dashboard</h1>

      {/* 3. CONTROLES DE FILTRO E EXPORTAÇÃO */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        
        {/* Filtro de Vendedor */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Vendedor:</label>
          {user?.relatorios_proprios_only ? (
            <input
              type="text"
              value={user.name}
              disabled
              className="mt-1 block w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          ) : (
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filtro de Data Inicial */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Data Inicial:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filtro de Data Final */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Data Final:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filtro de Origem */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Origem:</label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas</option>
            {availableOrigins.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        
        {/* Botões de Exportação */}
        <div className="col-span-1 flex flex-col space-y-2">
            <button
                onClick={() => handleExport('csv')}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
                disabled={loading || !dashboardData}
            >
                Exportar CSV
            </button>
            <button
                onClick={() => handleExport('pdf')}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition disabled:bg-gray-400"
                disabled={loading || !dashboardData}
            >
                Exportar PDF
            </button>
        </div>

      </div>

      {/* 4. CONTEÚDO DO DASHBOARD */}
      <div className="mt-6">
        
        {/* Mensagens de estado */}
        {loading && (
          <p className="text-center text-blue-500 p-10 font-medium">
            Carregando dados do dashboard...
          </p>
        )}
        
        {/* Exibe erro se houver, mesmo que a mensagem de carregamento tenha passado */}
        {!loading && error && (
          <p className="text-center text-red-500 font-medium p-10">{error}</p>
        )}
        
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