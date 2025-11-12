// src/pages/ReportsPage.jsx
import React from 'react';
import { useReports } from '../hooks/useReports';
import FilterBar from '../components/FilterBar.jsx';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import { FaFilePdf, FaFileCsv, FaFileExcel, FaFilter } from 'react-icons/fa';

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
  } = useReports(initialFilters);

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#1E293B]">
      {/* Top container to center content and keep max width */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold">Relatórios e Métricas</h1>
        </div>

        {/* ====== Header: filtros + ações (barra com fundo branco e sombra) ====== */}
        <div className="sticky top-6 z-30">
          <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: FilterBar (reutiliza seu componente) */}
            <div className="flex-1">
              <FilterBar
                currentFilters={filters}
                onFilterChange={updateFilter}
                onApplyFilters={applyFilters}
                isLoading={loading}
              />
            </div>

            {/* Right: ações / export */}
            <div className="flex items-center gap-3">
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A7F3C] hover:bg-[#187034] text-white font-semibold shadow-sm"
              >
                <FaFilter /> Aplicar Filtros
              </button>

              <div className="inline-flex items-center gap-2 bg-gray-50 p-2 rounded-lg border">
                <button
                  onClick={exportToCsv}
                  disabled={exporting}
                  title="Exportar CSV"
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-gray-700 border"
                >
                  <FaFileCsv /> CSV
                </button>

                <button
                  onClick={() => exportToPdf()}
                  disabled={exporting}
                  title="Exportar PDF"
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-gray-700 border"
                >
                  <FaFilePdf /> PDF
                </button>

                <button
                  onClick={() => {
                    // fallback para Excel — se você tiver rotina específica, use exportToExcel
                    // por ora reaproveita CSV ou backend implementado
                    exportToCsv();
                  }}
                  disabled={exporting}
                  title="Exportar Excel"
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-gray-700 border"
                >
                  <FaFileExcel /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Espaço entre header fixo e conteúdo */}
        <div className="mt-6">
          <ReportsDashboard data={data} loading={loading} error={error} />
        </div>

        {/* Mensagem caso não existam dados */}
        {!data && !loading && !error && (
          <div className="mt-8 p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl shadow-sm">
            📊 Use a barra de filtros acima e clique em <b>Aplicar Filtros</b> para carregar o relatório.
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
