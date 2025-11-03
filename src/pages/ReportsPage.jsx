// src/pages/ReportsPage.jsx

import React, { useState } from 'react';
import { useReports } from '../hooks/useReports';
import ReportsDashboard from '../components/reports/ReportsDashboard'; // O componente que vamos criar
import Sidebar from '../components/layout/Sidebar'; // Assumindo que você tem um componente Sidebar
import LoadingSpinner from '../components/ui/LoadingSpinner'; // Assumindo um componente de Loading
import ErrorMessage from '../components/ui/ErrorMessage'; // Assumindo um componente de Erro

// Dados mockados para os Selects, ajuste com seus dados reais de API/Context
const MOCK_VENDORS = [
    { id: '1', name: 'João Vendedor' },
    { id: '2', name: 'Maria Executiva' }
];
const MOCK_SOURCES = ['Google', 'Indicação', 'Marketing', 'Outro'];

function ReportsPage() {
    // Definir o estado inicial dos filtros (pode vir da URL ou de um estado global)
    const [currentFilters, setCurrentFilters] = useState({});
    
    // Conectar ao Hook de lógica
    const { 
        data, 
        loading, 
        error, 
        updateFilter, 
        applyFilters,
        filters 
    } = useReports(currentFilters);

    const handleFilterChange = (e) => {
        updateFilter(e.target.name, e.target.value);
    };

    const handleApply = (e) => {
        e.preventDefault();
        setCurrentFilters(filters); // Aplica os filtros atuais ao estado principal e chama a busca no hook
        applyFilters();
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Relatórios e Métricas</h1>

                {/* --- Área de Filtros e Exportação (Top Bar) --- */}
                <form onSubmit={handleApply} className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
                    
                    {/* Filtro de Período */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">De</label>
                        <input type="date" name="periodStart" onChange={handleFilterChange} className="p-2 border rounded-md" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Até</label>
                        <input type="date" name="periodEnd" onChange={handleFilterChange} className="p-2 border rounded-md" />
                    </div>

                    {/* Filtro de Vendedor */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Vendedor</label>
                        <select name="vendorId" onChange={handleFilterChange} className="p-2 border rounded-md">
                            <option value="">Todos</option>
                            {MOCK_VENDORS.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Origem */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Origem</label>
                        <select name="source" onChange={handleFilterChange} className="p-2 border rounded-md">
                            <option value="">Todas</option>
                            {MOCK_SOURCES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150">
                        Aplicar Filtros
                    </button>
                    
                    {/* Botões de Exportação */}
                    <div className="ml-auto flex space-x-2">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                            Exportar CSV
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            Gerar Relatório PDF
                        </button>
                    </div>
                </form>

                {/* --- Conteúdo Principal do Dashboard --- */}
                {loading && <LoadingSpinner message="Carregando métricas..." />}
                {error && <ErrorMessage message={error} />}
                
                {data && (
                    <ReportsDashboard data={data} filters={filters} />
                )}
            </main>
        </div>
    );
}

export default ReportsPage;