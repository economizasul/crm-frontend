// src/components/reports/ConversionChart.jsx

import React from 'react';

/**
 * Componente Gráfico de Conversão.
 * Placeholder para um futuro gráfico de barras/pizza (ex: usando Recharts).
 */
function ConversionChart({ data }) {
    if (!data) {
        return <div className="text-center p-8 text-gray-500">Nenhum dado de conversão disponível.</div>;
    }

    // Apenas um placeholder simples para indicar onde o gráfico real seria renderizado.
    return (
        <div className="w-full h-80 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-center">
                [Placeholder de Gráfico: Aqui seria renderizado o **Gráfico de Conversão por Fonte** (Ex: usando Recharts ou outra biblioteca).]
            </p>
        </div>
    );
}

export default ConversionChart;