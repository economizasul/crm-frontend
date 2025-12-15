// src/components/reports/LeadOriginFunnel.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Cores e tamanhos para os estágios do funil (em ordem de exibição)
const FUNNEL_STAGES = [
    { name: "Facebook..:", field: 'facebook', color: "#1D4ED8", colorLight: "#3B82F6", shadowStyle: "0 10px 25px rgba(29, 78, 216, 0.6)" }, 
    { name: "Orgânico..:", field: 'organico', color: "#065F46", colorLight: "#10B981", shadowStyle: "0 10px 25px rgba(6, 95, 70, 0.6)" }, 
    { name: "Google..:", field: 'google', color: "#92400E", colorLight: "#F59E0B", shadowStyle: "0 10px 25px rgba(146, 64, 14, 0.6)" }, 
    { name: "Indicação..:", field: 'indicacao', color: "#581C87", colorLight: "#9333EA", shadowStyle: "0 10px 25px rgba(88, 28, 135, 0.6)" }, 
    { name: "Instagram..:", field: 'instagram', color: "#BE185D", colorLight: "#EC4899", shadowStyle: "0 10px 25px rgba(190, 24, 93, 0.6)" }, 
    { name: "Parceria..:", field: 'parceria', color: "#991B1B", colorLight: "#EF4444", shadowStyle: "0 10px 25px rgba(153, 27, 27, 0.6)" }, 
];

const LeadOriginFunnel = ({ originStats, totalLeads }) => {
    
    const funnelData = FUNNEL_STAGES.map(stage => {
        const count = originStats[stage.field] || 0;
        const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
        return {
            ...stage,
            count: count,
            percent: percent,
        };
    }); 
    
    // Parâmetros do design 3D cilíndrico
    const baseWidth = 90; 
    const reductionPerStep = 8; // Reduzido para menos inclinação (mais cilíndrico)
    const height = 60; // Altura maior para efeito 3D stacked
    const verticalSpacing = 12; // Espaçamento entre camadas (separação visível, sem overlap forte)
    const borderRadius = 30; // Bordas bem arredondadas para cilindro
    
    // Altura total aproximada
    const totalFunnelHeight = funnelData.length * (height + verticalSpacing) - verticalSpacing + 60; // + margem para topo e base

    return (
        <div className="flex flex-col items-center pt-8 px-4 relative h-[600px] justify-start"> {/* Aumentei altura do container se necessário */}
            
            {/* TOPO DO FUNIL (OVAL MAIS INTEGRADO E 3D) */}
            <motion.div 
                initial={{ opacity: 0, scaleX: 0.9 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="w-full max-w-md h-16 bg-gray-800 rounded-full absolute top-8"
                style={{
                    width: `${baseWidth + 10}%`, 
                    boxShadow: `inset 0 8px 16px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.8)`,
                }}
            />

            {/* SEÇÕES DO FUNIL */}
            <div className="w-full max-w-md flex flex-col items-center relative mt-20"> 
                {funnelData.map((item, index) => {
                    
                    const currentWidth = Math.max(40, baseWidth - (index * reductionPerStep)); 
                    const nextWidth = Math.max(40, baseWidth - ((index + 1) * reductionPerStep)); 
                    const opacity = item.count > 0 ? 1 : 0.7; 

                    // Clip-path para trapézio suave
                    const clipPath = `polygon(
                        ${(100 - currentWidth) / 2}% 0%, 
                        ${100 - (100 - currentWidth) / 2}% 0%, 
                        ${100 - (100 - nextWidth) / 2}% 100%, 
                        ${(100 - nextWidth) / 2}% 100%
                    )`;
                    
                    const topPosition = index * (height + verticalSpacing); 
                    
                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            className="absolute w-full flex justify-center"
                            style={{ 
                                top: `${topPosition}px`, 
                                zIndex: 50 - index, 
                                opacity: opacity,
                            }} 
                        >
                            <div 
                                className="relative text-white font-semibold transition-transform duration-300 hover:scale-105 overflow-hidden"
                                style={{
                                    width: `${currentWidth}%`,
                                    height: `${height}px`,
                                    clipPath: clipPath,
                                    borderRadius: `${borderRadius}px`,
                                    boxShadow: item.shadowStyle + ', inset 0 4px 10px rgba(255,255,255,0.2)',
                                    backgroundImage: `
                                        linear-gradient(135deg, 
                                            ${item.colorLight} 0%, 
                                            ${item.color} 50%, 
                                            ${item.color} 100%
                                        ),
                                        radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.4) 0%, transparent 70%)
                                    `,
                                }}
                            >
                                {/* Informações CENTRALIZADAS */}
                                <div className="absolute inset-0 flex items-center justify-center px-8">
                                    <div className="flex flex-col items-center text-center">
                                        <span className="font-bold text-lg truncate" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                            {item.name}
                                        </span>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-extrabold">{item.count}</span> 
                                            <span className="text-lg font-semibold opacity-90">{item.percent.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* BASE DO FUNIL (TOTAL) */}
            <div 
                className="text-center w-full max-w-md absolute bottom-10"
                style={{ marginTop: `${totalFunnelHeight}px` }}
            >
                <div className="text-4xl font-extrabold text-gray-700 dark:text-gray-300">
                    {totalLeads}
                </div>
                <div className="text-base text-gray-600 dark:text-gray-400">Total de leads no período</div>
            </div>
        </div>
    );
};

export default LeadOriginFunnel;