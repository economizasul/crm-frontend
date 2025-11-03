// src/components/reports/FunnelChart.jsx

import React from 'react';
// Mantenha apenas o que é estritamente necessário ou o placeholder limpo.
// Você pode deixar a importação de lucide-react, mas ela só será usada no futuro.

function FunnelChart({ data }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Funil de Vendas</h3>
            <div className="text-gray-500 p-8 text-center">
                Gráfico de Funil (Em implementação. Dados virão do Backend.)
            </div>
        </div>
    );
}

export default FunnelChart;