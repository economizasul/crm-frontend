// src/components/reports/MotivosPerdaChart.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from "recharts";

const MotivosPerdaChart = ({ lostReasons }) => {

  if (!lostReasons || !lostReasons.reasons || lostReasons.reasons.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm text-center text-gray-500">
        Nenhum dado de motivos de perda encontrado.
      </div>
    );
  }

  const chartData = useMemo(() => {
    return lostReasons.reasons.map((r) => ({
      motivo: r.reason,
      quantidade: r.count,
      percent: r.percentage
    }));
  }, [lostReasons]);

  // paleta de cores
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="p-5">
      <h3 className="text-xl font-bold mb-5 text-gray-700">
        Motivos de Perda
      </h3>

      <div style={{ width: "100%", height: 310 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            {/* Motivos no eixo Y */}
            <YAxis
              dataKey="motivo"
              type="category"
              width={150}
              tick={{ fill: "#555", fontSize: 13 }}
            />

            {/* Oculta o eixo X */}
            <XAxis type="number" hide />

            {/* Barras */}
            <Bar
              dataKey="quantidade"
              barSize={20}
              radius={[6, 6, 6, 6]}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}

              {/* Quantidade dentro da barra */}
              <LabelList
                dataKey="quantidade"
                position="insideLeft"
                style={{ fill: "#fff", fontWeight: "bold" }}
              />

              {/* Percentual dentro da ponta da barra */}
              <LabelList
                dataKey="percent"
                position="insideRight"
                formatter={(v) => `${v}%`}
                style={{ fill: "#fff", fontWeight: "bold" }}
              />
            </Bar>

            <Tooltip
              formatter={(value, name) => {
                if (name === "quantidade") return [`${value} perdas`, "Quantidade"];
                if (name === "percent") return [`${value}%`, "Percentual"];
                return value;
              }}
              labelFormatter={(label) => `Motivo: ${label}`}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MotivosPerdaChart;
