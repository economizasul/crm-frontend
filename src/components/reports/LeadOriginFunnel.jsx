import React from 'react';
import { motion } from 'framer-motion';

// Cores e tamanhos para os estágios do funil (do topo para a base)
const FUNNEL_STAGES = [
    { name: "Facebook", baseColor: "bg-blue-600", colorShadow: "shadow-blue-900/50", topColor: "from-blue-500", shadow: "shadow-2xl" },
    { name: "Orgânico", baseColor: "bg-green-600", colorShadow: "shadow-green-900/50", topColor: "from-green-500", shadow: "shadow-xl" },
    { name: "Google", baseColor: "bg-yellow-600", colorShadow: "shadow-yellow-900/50", topColor: "from-yellow-500", shadow: "shadow-lg" },
    { name: "Indicação", baseColor: "bg-orange-600", colorShadow: "shadow-orange-900/50", topColor: "from-orange-500", shadow: "shadow-md" },
    { name: "Instagram", baseColor: "bg-pink-600", colorShadow: "shadow-pink-900/50", topColor: "from-pink-500", shadow: "shadow-sm" },
    { name: "Parceria", baseColor: "bg-red-600", colorShadow: "shadow-red-900/50", topColor: "from-red-500", shadow: "shadow-sm" },
];

/**
 * Componente que renderiza um funil visual em 3D para as origens de leads.
 * @param {object} props
 * @param {object} props.originStats - Objeto contendo as contagens por origem (e.g., { facebook: 29, organico: 20, ... })
 * @param {number} props.totalLeads - O número total de leads para cálculo de percentual.
 */
const LeadOriginFunnel = ({ originStats, totalLeads }) => {
    // 1. Mapeia e calcula os dados, garantindo a ordem
    const funnelData = FUNNEL_STAGES.map(stage => {
        const count = originStats[stage.name.toLowerCase()] || 0;
        const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
        return {
            ...stage,
            count: count,
            percent: percent,
        };
    }).filter(item => item.count > 0); // Filtra itens com zero para um funil mais limpo

    // Se não houver dados, retorna um placeholder
    if (funnelData.length === 0) {
        return <div className="text-center p-8 text-gray-500">Nenhum dado de origem disponível no período.</div>;
    }

    // O primeiro estágio (topo) terá 100% da largura máxima. Os demais se baseiam nele.
    const maxCount = funnelData[0]?.count || 1; 

    return (
        <div className="flex flex-col items-center pt-8 px-4 relative">
            
            {/* TOPO DO FUNIL (OVAL) */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-4/5 h-8 ${FUNNEL_STAGES[0].baseColor} rounded-full absolute -top-2 transform skew-x-[-15deg] shadow-lg`}
                style={{
                    boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.4), inset 0 3px 5px rgba(255, 255, 255, 0.5)`
                }}
            >
            </motion.div>

            {/* SEÇÕES DO FUNIL */}
            <div className="w-full max-w-sm flex flex-col items-center">
                {funnelData.map((item, index) => {
                    // Calcula a largura em relação ao topo (que é o maior valor)
                    const widthPercent = (item.count / maxCount) * 100;
                    
                    // Ajusta a classe para o efeito 3D de perspectiva
                    const funnelClass = `
                        w-[${widthPercent}%] 
                        h-12 
                        text-white 
                        font-semibold 
                        flex items-center justify-between 
                        px-4 py-1 
                        relative
                        transform
                        hover:scale-[1.01] transition-transform duration-300
                    `;
                    
                    // Estilo complexo para simular a forma de funil
                    const styleFunnelSegment = {
                        width: `${widthPercent}%`,
                        // Usa clip-path para criar o trapézio (funil)
                        clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
                        // Sombra para efeito 3D
                        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                    };

                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className={`w-full flex justify-center mt-[-10px] z-[${10 - index}]`} // z-index para sobreposição
                        >
                            <div 
                                className={`${item.baseColor} ${item.shadow} text-sm ${funnelClass}`} 
                                style={styleFunnelSegment}
                            >
                                <span className="font-medium text-left w-1/3 truncate">{item.name}..:</span>
                                <span className="font-extrabold text-right text-base">{item.count}</span>
                                <span className="text-xs text-right opacity-80 w-1/4">{item.percent.toFixed(1)}%</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* BASE DO FUNIL (FECHAMENTO) */}
            <div className="text-center mt-10">
                <div className="text-3xl font-extrabold text-gray-600">
                    {totalLeads}
                </div>
                <div className="text-sm text-gray-600">Total de leads no período</div>
            </div>
        </div>
    );
};

export default LeadOriginFunnel;