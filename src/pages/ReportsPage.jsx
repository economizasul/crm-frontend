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
  ownerId: 'all',
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
    setData,
    setError,
    setLoading
  } = useReports(initialFilters);

  // 🔧 Mantemos a função mas agora ela chama a função correta do hook
  const handleApplyFilters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await applyFilters(); // ✅ Chama o hook (POST /reports/data)
    } catch (err) {
      console.error('Erro ao aplicar filtros:', err);
      setError('Falha ao aplicar filtros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [applyFilters, setError, setLoading]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Título Principal */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <FaChartBar className="mr-3 text-indigo-600" />
        Dashboard de Relatórios
      </h1>

      {/* Barra de Filtros */}
      {/* ✅ Comentário movido para fora da prop */}
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
