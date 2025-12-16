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

export default function LossReasonsChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-xl p-4 mt-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Motivos de Perda
        </h2>
        <div className="text-center text-gray-500 py-10">
          Nenhum motivo de perda no período selecionado
        </div>
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
            data={data}
            layout="vertical"
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="reason" type="category" width={150} />
            <Tooltip />

            <Bar dataKey="total" radius={[8, 8, 8, 8]}>
              {data.map((_, index) => (
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
