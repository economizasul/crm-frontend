// src/components/reports/LeadOriginFunnel.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Cores e tamanhos para os estágios do funil
const FUNNEL_STAGES = [
    { name: "Facebook", field: 'facebook', color: "#1D4ED8", colorLight: "#3B82F6", shadowStyle: "0 10px 25px rgba(29, 78, 216, 0.6)" }, 
    { name: "Orgânico", field: 'organico', color: "#065F46", colorLight: "#10B981", shadowStyle: "0 10px 25px rgba(6, 95, 70, 0.6)" }, 
    { name: "Google", field: 'google', color: "#92400E", colorLight: "#F59E0B", shadowStyle: "0 10px 25px rgba(146, 64, 14, 0.6)" }, 
    { name: "Indicação", field: 'indicacao', color: "#581C87", colorLight: "#9333EA", shadowStyle: "0 10px 25px rgba(88, 28, 135, 0.6)" }, 
    { name: "Instagram", field: 'instagram', color: "#BE185D", colorLight: "#EC4899", shadowStyle: "0 10px 25px rgba(190, 24, 93, 0.6)" }, 
    { name: "Parceria", field: 'parceria', color: "#991B1B", colorLight: "#EF4444", shadowStyle: "0 10px 25px rgba(153, 27, 27, 0.6)" }, 
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
    
    // Parâmetros ajustados
    const baseWidth = 80;
    const reductionPerStep = 5;
    const sectionHeight = 65;
    const verticalOverlap = 18;
    const borderRadius = '50% / 30%';

    return (
        <div className="flex flex-col items-center pt-4 px-3 relative h-[460px] justify-start overflow-hidden" style={{ perspective: '800px' }}>
            
            {/* TOPO DO FUNIL */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xs h-14 bg-gray-800 rounded-t-full absolute top-2"
                style={{
                    width: `${baseWidth + 5}%`, 
                    boxShadow: `inset 0 6px 12px rgba(0,0,0,0.5), 0 8px 25px rgba(0,0,0,0.8)`,
                    transform: 'rotateX(15deg)',
                }}
            />

            {/* SEÇÕES DO FUNIL */}
            <div className="w-full max-w-xs flex flex-col items-center relative mt-8" style={{ transform: 'rotateX(15deg)' }}>
                {funnelData.map((item, index) => {
                    const currentWidth = Math.max(40, baseWidth - (index * reductionPerStep)); 
                    const opacity = item.count > 0 ? 1 : 0.75; 
                    const topPosition = index * (sectionHeight - verticalOverlap); // Cálculo correto
                    
                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.12, duration: 0.6 }}
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
                                    height: `${sectionHeight}px`,
                                    borderRadius: borderRadius,
                                    boxShadow: `${item.shadowStyle}, inset 0 5px 15px rgba(255,255,255,0.25), inset 0 -5px 15px rgba(0,0,0,0.3)`,
                                    backgroundImage: `
                                        linear-gradient(145deg, ${item.colorLight} 20%, ${item.color} 60%, ${item.colorLight} 100%),
                                        radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.35) 0%, transparent 80%)
                                    `,
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                                    <span className="font-bold text-md truncate" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.7)' }}>
                                        {item.name}...: {item.count} {item.percent.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* BASE DO FUNIL - TOTAL FIXO NO FUNDO */}
            <div 
                className="text-center w-full max-w-xs absolute bottom-4" 
                style={{ transform: 'rotateX(15deg)' }}
            >
                <div className="text-3xl font-extrabold text-gray-700 dark:text-gray-300">
                    {totalLeads}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de leads no período</div>
            </div>
        </div>
    );
};

export default LeadOriginFunnel;