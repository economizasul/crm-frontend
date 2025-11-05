// src/pages/ReportsPage.js (Exemplo em React)

import React, { useState, useEffect } from 'react';
// Importa o novo serviço de relatórios
import { fetchDashboardMetrics } from '../services/ReportService'; 
import ReportsDashboard from '../components/ReportsDashboard';
// import mockData from '../data/mockReports'; // <-- REMOVA OU COMENTE ISTO

const initialFilters = { 
    startDate: '2024-01-01', 
    endDate: '2024-12-31', 
    vendorId: 'all', 
    source: 'all' 
};

function ReportsPage() {
    const [metrics, setMetrics] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadMetrics = async () => {
        setLoading(true);
        setError(null);
        try {
            // ⭐️ SUBSTITUIÇÃO AQUI ⭐️
            // Chama a API do Backend com os filtros
            const data = await fetchDashboardMetrics(filters); 
            
            setMetrics(data); // Define os dados reais retornados pelo Backend
        } catch (err) {
            setError('Falha ao carregar dados do relatório. Tente novamente.');
            setMetrics(null); // Limpa dados em caso de erro
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [filters]); // Recarrega sempre que os filtros mudam

    // Função para ser passada aos componentes de filtro
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    if (loading && !metrics) {
        return <div>Carregando Relatórios...</div>;
    }
    
    if (error) {
        return <div>Erro: {error}</div>;
    }
    
    // Passa os dados reais e as funções de filtro para o componente Dashboard
    return (
        <div>
            <h1>Dashboard de Relatórios</h1>
            {/* Aqui você passa o handleFilterChange para o seu componente de filtro */}
            {/* ... Componentes de Filtro ... */}
            
            {metrics && (
                <ReportsDashboard 
                    metrics={metrics} 
                    currentFilters={filters}
                    onFilterChange={handleFilterChange}
                    // Adicione props para exportação aqui
                />
            )}
        </div>
    );
}

export default ReportsPage;