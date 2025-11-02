// src/pages/ReportsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { useAuth } from '../AuthContext';
import ReportsDashboard from '../components/reports/ReportsDashboard';

const ReportsPage = () => {
  const { user, token } = useAuth(); // ✅ token garantido

  // 1. ESTADO DOS FILTROS
  const [vendedores, setVendedores] = useState([]);
  const [vendedorId, setVendedorId] = useState(
    user?.relatorios_proprios_only ? user.id : ''
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [availableOrigins, setAvailableOrigins] = useState([]);

  // 2. ESTADO DOS DADOS E CARREGAMENTO
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar lista de vendedores e origens
  const fetchFilters = useCallback(async () => {
    try {
      const sellersRes = await api.get('/reports/sellers', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setVendedores(sellersRes.data);
      setAvailableOrigins(['Google Ads', 'Indicação', 'Redes Sociais', 'Parceria']);
    } catch (err) {
      console.error('Erro ao buscar filtros:', err.response || err);
    }
  }, [token]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Função para buscar os dados do dashboard
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

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v)
      );

      const response = await api.get('/reports/dashboard-data', {
        params: filteredParams,
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      if (response.status === 204) {
        setDashboardData(null);
        setError('Nenhum dado encontrado para os filtros selecionados.');
      } else {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err.response?.data?.error || 'Não foi possível carregar o dashboard.');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [vendedorId, startDate, endDate, originFilter, token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Exportação CSV/PDF
  const handleExport = async (format) => {
    try {
      const params = {
        exportFormat: format,
        ownerId: vendedorId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        origin: originFilter || undefined,
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v)
      );

      const response = await api.get('/reports/export', {
        params: filteredParams,
        responseType: 'blob',
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `relatorio_leads.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro na exportação:', error.response?.data || error);
      alert('Erro ao gerar o arquivo de exportação. Verifique se há dados e tente novamente.');
    }
  };

  // RENDER
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Relatórios e Dashboard</h1>

      {/* FILTROS E EXPORTAÇÃO */}
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
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Datas e Origem */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Data Inicial:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Data Final:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Origem:</label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas</option>
            {availableOrigins.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Exportação */}
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

      {/* DASHBOARD */}
      <div className="mt-6">
        {loading && (
          <p className="text-center text-blue-500 p-10 font-medium">
            Carregando dados do dashboard...
          </p>
        )}
        {!loading && error && (
          <p className="text-center text-red-500 font-medium p-10">{error}</p>
        )}
        {!loading && dashboardData && !error && (
          <ReportsDashboard data={dashboardData} />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
