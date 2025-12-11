import React from 'react';
import { motion } from 'framer-motion';

// Cores e sombras para os estágios do funil
const FUNNEL_STAGES = [
    { name: "Facebook..:", field: 'facebook', baseColor: "bg-blue-600", shadowStyle: "shadow-2xl shadow-blue-500/50" },
    { name: "Orgânico..:", field: 'organico', baseColor: "bg-green-600", shadowStyle: "shadow-xl shadow-green-500/50" },
    { name: "Google..:", field: 'google', baseColor: "bg-yellow-600", shadowStyle: "shadow-lg shadow-yellow-500/50" },
    { name: "Indicação..:", field: 'indicacao', baseColor: "bg-purple-600", shadowStyle: "shadow-md shadow-purple-500/50" },
    { name: "Instagram..:", field: 'instagram', baseColor: "bg-pink-600", shadowStyle: "shadow-md shadow-pink-500/50" },
    { name: "Parceria..:", field: 'parceria', baseColor: "bg-red-600", shadowStyle: "shadow-sm shadow-red-500/50" },
];

const LeadOriginFunnel = ({ originStats, totalLeads }) => {
    // 1. Mapeia e calcula os dados. Removemos a ordenação e o filtro.
    const funnelData = FUNNEL_STAGES.map(stage => {
        const count = originStats[stage.field] || 0;
        const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
        return {
            ...stage,
            count: count,
            percent: percent,
        };
    }); 
    
    // NOTA: Usamos 'funnelData' diretamente, sem filtrar por count > 0.
    
    return (
        <div className="flex flex-col items-center pt-8 px-4 relative">
            
            {/* TOPO DO FUNIL (OVAL ESTÉTICO) */}
            <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className={`w-4/5 h-4 bg-gray-900 rounded-full absolute -top-1`}
                style={{
                    boxShadow: `inset 0 2px 5px rgba(255, 255, 255, 0.4), 0 0 15px rgba(0, 0, 0, 0.8)`
                }}
            />

            {/* SEÇÕES DO FUNIL */}
            <div className="w-full max-w-sm flex flex-col items-center mt-4">
                {funnelData.map((item, index) => {
                    
                    // 🛑 NOVA LÓGICA DE LARGURA: Redução suave e fixa baseada no INDEX
                    // O primeiro item (index 0) tem 100% (w-full do container max-w-sm).
                    // Cada item subsequente perde 5% (ou 8% para ser um funil mais visível) de largura.
                    const reductionPerStep = 8;
                    const widthPercent = Math.max(10, 100 - (index * reductionPerStep)); // Garante uma largura mínima de 10%

                    // O item não será totalmente transparente, apenas ligeiramente desbotado se o valor for 0
                    const opacity = item.count > 0 ? 1 : 0.6; 

                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className="w-full flex justify-center mt-[-16px] z-[10]" 
                            style={{ margin: '0 auto', opacity: opacity }} 
                        >
                            <div 
                                className={`h-12 rounded-lg ${item.baseColor} ${item.shadowStyle} text-white font-semibold flex items-center justify-between px-5 py-1 transition-transform duration-300 hover:scale-[1.01]`}
                                style={{
                                    width: `${widthPercent}%`, // Largura baseada na posição (índice)
                                    // Gradiente para efeito 3D
                                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.2), transparent 50%, rgba(255,255,255,0.2))`,
                                }}
                            >
                                <span className="font-medium text-left truncate">{item.name}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold">{item.count}</span>
                                    {/* Exibe 0.0% se o valor for 0 */}
                                    <span className="text-xs opacity-90">{item.percent.toFixed(1)}%</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* BASE DO FUNIL (TOTAL) */}
            <div className="text-center mt-8">
                <div className="text-3xl font-extrabold text-gray-600">
                    {totalLeads}
                </div>
                <div className="text-sm text-gray-600">Total de leads no período</div>
            </div>
        </div>
    );
};

export default LeadOriginFunnel;