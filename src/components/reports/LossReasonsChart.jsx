// src/components/reports/LossReasonsChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function LossReasonsChart({ lostReasonsData }) {
  const chartData = (lostReasonsData?.reasons || []).map(item => ({
    reason: item.reason,
    total: Number(item.total || 0),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-xl p-4 mt-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Motivos de Perda
        </h2>
        <p className="text-gray-500 text-sm">Nenhum dado no período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-4 mt-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        Motivos de Perda
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="reason" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="total" radius={[8, 8, 8, 8]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="#0099ff"
                  stroke="#006bb3"
                  strokeWidth={1.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
