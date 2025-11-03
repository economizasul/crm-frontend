// src/components/reports/ForecastCard.jsx

import React from 'react';
import { TrendUp, PiggyBank, Target } from 'lucide-react'; // Assumindo o uso de lucide-react ou similar

/**
 * Componente Card que exibe os dados de Previsão de Vendas (Forecasting).
 * @param {Object} forecast - Objeto contendo as métricas de previsão (salesForecast).
 */
function ForecastCard({ forecast }) {
    
    if (!forecast) {
        return <div className="p-4 text-gray-500">Nenhum dado de previsão disponível.</div>;
    }

    // Função auxiliar para formatar valores monetários
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    // Card de Previsão Ponderada (o principal)
    const WeightedForecast = () => (
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-xl flex items-center justify-between transition transform hover:scale-[1.02] duration-300">
            <div>
                <p className="text-lg font-medium opacity-80 flex items-center">
                    <TrendUp className="h-5 w-5 mr-2" /> Previsão Ponderada
                </p>
                <h2 className="text-4xl font-extrabold mt-1">
                    {formatCurrency(forecast.weightedValue)}
                </h2>
                <p className="text-sm opacity-90 mt-2">
                    Valor esperado de fechamentos com base na fase do funil.
                </p>
            </div>
            <Target className="h-12 w-12 opacity-30" />
        </div>
    );

    // Card de Valor Total (sem ponderação)
    const TotalValueCard = () => (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex items-center transition hover:shadow-md">
            <PiggyBank className="h-6 w-6 text-yellow-600 mr-4" />
            <div>
                <p className="text-sm text-gray-500">Valor Total no Funil</p>
                <p className="text-xl font-semibold text-gray-800">
                    {formatCurrency(forecast.totalValue)}
                </p>
            </div>
        </div>
    );
    
    // Card de Próximo Fechamento (Mock)
    // Você pode substituir isso por um dado real do seu ReportDataService no futuro
    const NextClosureCard = () => (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex items-center transition hover:shadow-md">
            <svg className="h-6 w-6 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <div>
                <p className="text-sm text-gray-500">Próxima Data Estimada</p>
                <p className="text-xl font-semibold text-gray-800">
                    15 de Dezembro
                </p>
            </div>
        </div>
    );


    return (
        <div className="grid grid-cols-1 gap-6">
            <WeightedForecast />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TotalValueCard />
                <NextClosureCard />
            </div>
        </div>
    );
}

export default ForecastCard;