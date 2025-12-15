import React from 'react';
import { motion } from 'framer-motion';

// Cores e tamanhos para os estágios do funil (em ordem de exibição)
const FUNNEL_STAGES = [
    { name: "Facebook..:", field: 'facebook', color: "#1D4ED8", colorLight: "#3B82F6", shadowStyle: "0 5px 15px rgba(29, 78, 216, 0.7)" }, 
    { name: "Orgânico..:", field: 'organico', color: "#065F46", colorLight: "#10B981", shadowStyle: "0 5px 15px rgba(6, 95, 70, 0.7)" }, 
    { name: "Google..:", field: 'google', color: "#92400E", colorLight: "#F59E0B", shadowStyle: "0 5px 15px rgba(146, 64, 14, 0.7)" }, 
    { name: "Indicação..:", field: 'indicacao', color: "#581C87", colorLight: "#9333EA", shadowStyle: "0 5px 15px rgba(88, 28, 135, 0.7)" }, 
    { name: "Instagram..:", field: 'instagram', color: "#BE185D", colorLight: "#EC4899", shadowStyle: "0 5px 15px rgba(190, 24, 93, 0.7)" }, 
    { name: "Parceria..:", field: 'parceria', color: "#991B1B", colorLight: "#EF4444", shadowStyle: "0 5px 15px rgba(153, 27, 27, 0.7)" }, 
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
    
    // Define os parâmetros estéticos do funil:
    const baseWidth = 100; 
    const reductionPerStep = 10; // DIMINUÍDO para 5 (funil mais cheio, menos inclinado)
    const height = 45; 
    const verticalOverlap = 0.7; 
    const borderRadiusFunnel = 8; // AUMENTADO para 18px (arredondamento máximo)

    return (
        <div className="flex flex-col items-center justify-center h-full px-4 relative">
            
            {/* TOPO DO FUNIL (OVAL ESTÉTICO) */}
            <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className={`w-full h-4 bg-gray-900 rounded-full absolute top-8`}
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))' }}
            >
            </motion.div>

            {/* SEÇÕES DO FUNIL */}
            <div className="w-full max-w-xl flex flex-col items-center">
                {funnelData.map((item, index) => {
                    
                    const currentWidth = Math.max(30, baseWidth - (index * reductionPerStep)); 
                    const nextWidth = Math.max(30, baseWidth - ((index + 1) * reductionPerStep)); 
                    const opacity = item.count > 0 ? 1 : 0.6; 

                    // Cria o caminho do clip (trapézio)
                    const clipPath = `polygon(
                        ${(100 - currentWidth) / 2}% 0%, 
                        ${100 - (100 - currentWidth) / 2}% 0%, 
                        ${100 - (100 - nextWidth) / 2}% 100%, 
                        ${(100 - nextWidth) / 2}% 100%
                    )`;
                    
                    const topPosition = index * (height * verticalOverlap); 
                    
                    const borderStyles = {
                         borderRadius: `${borderRadiusFunnel}px`, 
                    };

                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="absolute w-full flex justify-center"
                            style={{ 
                                top: `${topPosition}px`, 
                                zIndex: 50 - index, 
                                opacity: opacity,
                            }} 
                        >
                            <div 
                                className="relative text-white font-semibold transition-transform duration-300 hover:scale-[1.01] overflow-hidden"
                                style={{
                                    width: `100%`, 
                                    maxWidth: '100%',
                                    height: `${height}px`,
                                    clipPath: clipPath,
                                    boxShadow: item.shadowStyle,
                                    backgroundImage: `
                                        linear-gradient(to top, 
                                            ${item.color}, 
                                            ${item.colorLight} 50%, 
                                            ${item.color}
                                        ),
                                        radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.3) 0%, transparent 80%)
                                    `,
                                    ...borderStyles, 
                                }}
                            >
                                {/* TEXTO DENTRO DA BARRA - Centralização e negrito para destacar */}
                                <div className="absolute inset-0 flex items-center justify-between px-4"> 
                                    {/* AJUSTE: Nome do campo mais compacto */}
                                    <span className="font-semibold text-sm truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                        {item.name.replace("..:", "")} {/* Remoção de "..:" */}
                                    </span>
                                    
                                    <div className="flex items-baseline gap-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                        {/* AJUSTE: Contagem e Porcentagem lado a lado */}
                                        <span className="text-lg font-extrabold">{item.count}</span>
                                        <span className="text-sm font-semibold opacity-90">{item.percent.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* BASE DO FUNIL */}
            <div 
                className="text-center w-full max-w-xl"
                style={{ marginTop: `${funnelData.length * (height * verticalOverlap)}px` }}
            >
                {/* AJUSTE: pt-4 para diminuir o espaçamento interno */}
                <div className="text-3xl font-extrabold text-gray-600 pt-4">
                    {totalLeads}
                </div>
                {/* AJUSTE: Remoção do pb-4 para otimizar o espaço */}
                <div className="text-sm text-gray-600">Total de leads no período</div>
            </div>
        </div>
    );
};

export default LeadOriginFunnel;