// src/pages/ReportsPage.jsx
import React, { useCallback } from 'react';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { FaChartBar } from 'react-icons/fa';

// Filtros iniciais com data atual
const initialFilters = {
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  vendorId: 'all',
  source: 'all'
};

function ReportsPage() {
  const {
    data,
    filters,
    loading,
    error,
    exporting,
    updateFilter,
    applyFilters,
    exportToCsv,
    exportToPdf,
    setData, // <-- vamos usar para atualizar caso precise
    setError,
    setLoading
  } = useReports(initialFilters);

  // 🔧 Reescreve a função applyFilters para normalizar o retorno da API
  const handleApplyFilters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || '/api/v1'}/reports?` +
          new URLSearchParams({
            ownerId: filters.vendorId !== 'all' ? filters.vendorId : '',
            startDate: filters.startDate,
            endDate: filters.endDate,
            source: filters.source !== 'all' ? filters.source : ''
          }),
        { credentials: 'include' }
      );

      const json = await res.json();

      // 🔍 Normaliza o formato da resposta
      let payload = json;
      if (payload && payload.success && payload.data) {
        payload = payload.data;
      }

      // Se o backend retorna { productivity: {...}, conversionBySource: [...] }
      if (payload && payload.productivity) {
        setData(payload);
      } else if (payload && Object.keys(payload).length > 0) {
        // formato antigo
        setData({ productivity: payload });
      } else {
        setError('Nenhum dado encontrado para o período selecionado.');
        setData(null);
      }
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      setError('Falha ao carregar dados do relatório. Tente novamente.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, setData, setError, setLoading]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Título Principal */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <FaChartBar className="mr-3 text-indigo-600" />
        Dashboard de Relatórios
      </h1>

      {/* Barra de Filtros */}
      <FilterBar
        currentFilters={filters}
        onFilterChange={updateFilter}
        onApplyFilters={handleApplyFilters}
        exportToCsv={exportToCsv}
        exportToPdf={exportToPdf}
        isExporting={exporting}
        isLoading={loading}
      />

      {/* Dashboard */}
      <div className="mt-6">
        <ReportsDashboard data={data} loading={loading} error={error} />
      </div>

      {/* Mensagem inicial */}
      {!data && !loading && !error && (
        <div className="mt-8 p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded-lg">
          📊 Use a barra de filtros acima e clique em <b>Aplicar Filtros</b> para carregar o relatório.
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
