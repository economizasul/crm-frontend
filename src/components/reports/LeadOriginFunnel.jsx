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
    const baseWidth = 96; 
    // MUDANÇA: Aumenta a inclinação (funil mais elegante)
    const reductionPerStep = 15; 
    // MUDANÇA: Diminui a altura (funil mais compacto)
    const height = 40; 
    // MUDANÇA: Diminui a sobreposição (efeito mais de funil)
    const verticalOverlap = 0.7; 
    const borderRadiusFunnel = 18; 
    
    // Altura total do funil para posicionar o totalLeads no final
    const totalFunnelHeight = funnelData.length * (height * verticalOverlap) + (height - (height * verticalOverlap));
    
    // Lista de nomes de origem à esquerda
    const originNames = (
        <div className="absolute left-0 top-0 h-full flex flex-col justify-start pt-14 pl-10">
            {funnelData.map((item, index) => {
                const topOffset = index * (height * verticalOverlap) + (height / 2);
                return (
                    <motion.div
                        key={`name-${item.field}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="absolute text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                        style={{ 
                            top: `${topOffset}px`, 
                            transform: 'translateY(-50%)',
                            color: item.colorLight, // Usa a cor do funil
                        }}
                    >
                        {item.name}
                    </motion.div>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col items-center pt-8 px-4 relative h-[480px]"> {/* h-[480px] é do ReportsDashboard */}
            
            {/* O nome da origem agora fica à esquerda do funil */}
            {originNames} 

            {/* TOPO DO FUNIL (OVAL ESTÉTICO) */}
            <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                // MUDANÇA: top-10 para centralizar verticalmente o funil visualmente
                className={`w-full h-3 bg-gray-900 rounded-full absolute top-10`} 
                style={{
                    width: `${baseWidth}%`, 
                    boxShadow: `inset 0 2px 5px rgba(255, 255, 255, 0.4), 0 0 15px rgba(0, 0, 0, 0.8)`
                }}
            />

            {/* SEÇÕES DO FUNIL */}
            <div 
                className="w-full max-w-xl flex flex-col items-center mt-6 relative"
                // MUDANÇA: Adiciona padding superior para dar o offset do topo oval
                style={{ paddingTop: '30px' }} 
            >
                {funnelData.map((item, index) => {
                    
                    // Cálculo da largura do trapézio
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
                                {/* MUDANÇA PRINCIPAL: Centraliza o conteúdo horizontalmente */}
                                <div className="absolute inset-0 flex items-center justify-center"> 
                                    <div className="flex items-baseline gap-2" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                        <span className="text-xl font-extrabold">{item.count}</span>
                                        <span className="text-sm font-semibold opacity-90">{item.percent.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* BASE DO FUNIL (POSICIONADO APÓS A ALTURA CALCULADA) */}
            <div 
                className="text-center w-full max-w-xl"
                style={{ 
                    marginTop: `${totalFunnelHeight}px`,
                }}
            >
                <div className="text-3xl font-extrabold text-gray-600 pt-8">
                    {totalLeads}
                </div>
                <div className="text-sm text-gray-600 pb-4">Total de leads no período</div>
            </div>
        </div>
    );
};

export default LeadOriginFunnel;