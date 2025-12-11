import React from 'react';
import { motion } from 'framer-motion';

// Cores e tamanhos para os estágios do funil (em ordem de exibição)
const FUNNEL_STAGES = [
    { name: "Facebook..:", field: 'facebook', color: "#1D4ED8", colorLight: "#3B82F6", shadowStyle: "0 5px 15px rgba(29, 78, 216, 0.7)" }, // Azul (Indigo)
    { name: "Orgânico..:", field: 'organico', color: "#065F46", colorLight: "#10B981", shadowStyle: "0 5px 15px rgba(6, 95, 70, 0.7)" }, // Verde Escuro (Emerald)
    { name: "Google..:", field: 'google', color: "#92400E", colorLight: "#F59E0B", shadowStyle: "0 5px 15px rgba(146, 64, 14, 0.7)" }, // Laranja (Amber)
    { name: "Indicação..:", field: 'indicacao', color: "#581C87", colorLight: "#9333EA", shadowStyle: "0 5px 15px rgba(88, 28, 135, 0.7)" }, // Roxo (Violet)
    { name: "Instagram..:", field: 'instagram', color: "#BE185D", colorLight: "#EC4899", shadowStyle: "0 5px 15px rgba(190, 24, 93, 0.7)" }, // Rosa (Pink)
    { name: "Parceria..:", field: 'parceria', color: "#991B1B", colorLight: "#EF4444", shadowStyle: "0 5px 15px rgba(153, 27, 27, 0.7)" }, // Vermelho (Red)
];

const LeadOriginFunnel = ({ originStats, totalLeads }) => {
    // 1. Mapeia e calcula os dados
    const funnelData = FUNNEL_STAGES.map(stage => {
        const count = originStats[stage.field] || 0;
        const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
        return {
            ...stage,
            count: count,
            percent: percent,
        };
    }); 
    
    // Define os parâmetros estéticos do funil (redução constante de largura)
    const baseWidth = 90; // Largura inicial em %
    const reductionPerStep = 10; // Redução de largura por etapa (em %)
    const height = 60; // Altura de cada seção em px

    return (
        <div className="flex flex-col items-center pt-8 px-4 relative">
            
            {/* SEÇÕES DO FUNIL */}
            <div className="w-full max-w-lg flex flex-col items-center">
                {funnelData.map((item, index) => {
                    
                    // LÓGICA DE LARGURA: Redução suave e fixa baseada no INDEX (Forma estética de Funil)
                    const currentWidth = Math.max(20, baseWidth - (index * reductionPerStep));
                    const nextWidth = Math.max(20, baseWidth - ((index + 1) * reductionPerStep));

                    // Opacidade: Itens com valor zero ficam levemente desbotados
                    const opacity = item.count > 0 ? 1 : 0.4; 

                    // Cria o caminho do clip (trapézio)
                    const clipPath = `polygon(0% 0%, 100% 0%, ${50 + nextWidth / 2}% 100%, ${50 - nextWidth / 2}% 100%)`;
                    
                    // Conteúdo principal
                    const content = (
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold">{item.count}</span>
                            <span className="text-sm font-semibold opacity-90">{item.percent.toFixed(1)}%</span>
                        </div>
                    );

                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="absolute w-full flex justify-center"
                            style={{ 
                                // Posiciona verticalmente (altura * índice)
                                top: `${index * (height * 0.85)}px`, 
                                zIndex: 50 - index, // Garante que o item de cima sobreponha o de baixo
                                opacity: opacity,
                            }} 
                        >
                            <div 
                                className="relative text-white font-semibold transition-transform duration-300 hover:scale-[1.01]"
                                style={{
                                    width: `${currentWidth}%`, // Largura baseada no índice
                                    height: `${height}px`,
                                    // Aplica o formato de funil (trapézio)
                                    clipPath: clipPath,
                                    
                                    // Efeitos 3D
                                    boxShadow: item.shadowStyle,
                                    backgroundImage: `
                                        linear-gradient(to top, 
                                            ${item.color}, 
                                            ${item.colorLight} 50%, 
                                            ${item.color}
                                        ),
                                        radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.3) 0%, transparent 80%)
                                    `,
                                }}
                            >
                                {/* TEXTO DENTRO DA BARRA */}
                                <div className="absolute inset-0 flex items-center justify-between px-5">
                                    <span className="font-medium text-base truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                                        {item.name}
                                    </span>
                                    <div className="flex items-baseline gap-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                                        <span className="text-xl font-bold">{item.count}</span>
                                        <span className="text-sm font-semibold opacity-90">{item.percent.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* BASE DO FUNIL (Total e Espaçamento) */}
            <div 
                className="text-center w-full max-w-lg"
                style={{ marginTop: `${funnelData.length * (height * 0.85)}px` }} // Empurra o total para baixo
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