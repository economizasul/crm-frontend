// src/components/reports/MotivosPerdaChart.jsx
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const MotivosPerdaChart = ({ lostReasons }) => {
  if (!lostReasons || !lostReasons.reasons || lostReasons.reasons.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm text-center text-gray-500">
        Nenhum dado de motivos de perda encontrado.
      </div>
    );
  }

  const totalLost = lostReasons.totalLost || 0;

  const chartData = useMemo(() => {
    return lostReasons.reasons.map((r) => ({
      motivo: r.motivo,
      quantidade: r.quantidade,
      percent: totalLost > 0 ? ((r.quantidade / totalLost) * 100).toFixed(1) : 0,
    }));
  }, [lostReasons]);

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Motivos de Perda</h3>

      <div style={{ width: "100%", height: 310 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            width={500}
            height={300}
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            {/* Motivos no eixo Y */}
            <YAxis
              dataKey="motivo"
              type="category"
              width={120}
              tick={{ fill: "#555", fontSize: 13 }}
            />

            {/* Quantidades no eixo X (mas não exibimos o número aqui) */}
            <XAxis type="number" hide />

            {/* Barra horizontal */}
            <Bar dataKey="quantidade" fill="#2563eb" radius={[4, 4, 4, 4]}>

              {/* Número dentro da barra */}
              <LabelList
                dataKey="quantidade"
                position="insideLeft"
                offset={10}
                style={{ fill: "#fff", fontWeight: "bold" }}
              />

              {/* Porcentagem no final da barra */}
              <LabelList
                dataKey="percent"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fill: "#1e40af", fontWeight: "bold" }}
              />

            </Bar>

            {/* Tooltip moderno */}
            <Tooltip
              formatter={(value, name, props) => {
                if (name === "quantidade") return [`${value} perdas`, "Quantidade"];
                if (name === "percent") return [`${value}%`, "Porcentagem"];
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
