// src/components/reports/MotivosPerdaChart.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Adicionei colorLight
const ALL_LOST_REASONS = [
    { name: 'Oferta Melhor..:', field: 'oferta melhor', color: '#DC2626', colorLight: '#EF4444', shadow: '0 6px 16px rgba(220, 38, 38, 0.7)' },
    { name: 'Incerteza..:', field: 'incerteza', color: '#F59E0B', colorLight: '#FBBF24', shadow: '0 6px 16px rgba(245, 158, 11, 0.7)' },
    { name: 'Geração Própria..:', field: 'geracao propria', color: '#10B981', colorLight: '#34D399', shadow: '0 6px 16px rgba(16, 185, 129, 0.7)' },
    { name: 'Burocracia..:', field: 'burocracia', color: '#4F46E5', colorLight: '#818CF8', shadow: '0 6px 16px rgba(79, 70, 229, 0.7)' },
    { name: 'Contrato..:', field: 'contrato', color: '#9333EA', colorLight: '#C084FC', shadow: '0 6px 16px rgba(147, 51, 234, 0.7)' },
    { name: 'Restrições Técnicas..:', field: 'restricoes tecnicas', color: '#3B82F6', colorLight: '#60A5FA', shadow: '0 6px 16px rgba(59, 130, 246, 0.7)' },
    { name: 'Não é o Responsável..:', field: 'nao e o responsavel', color: '#F472B6', colorLight: '#FCA5D7', shadow: '0 6px 16px rgba(244, 114, 182, 0.7)' },
    { name: 'Silêncio..:', field: 'silencio', color: '#6B7280', colorLight: '#9CA3AF', shadow: '0 6px 16px rgba(107, 114, 128, 0.7)' },
    { name: 'Já Possui GD..:', field: 'ja possui gd', color: '#EAB308', colorLight: '#FCD34D', shadow: '0 6px 16px rgba(234, 179, 8, 0.7)' },
    { name: 'Outro Estado..:', field: 'outro estado', color: '#14B8A6', colorLight: '#2DD4BF', shadow: '0 6px 16px rgba(20, 184, 166, 0.7)' },
];

const MotivosPerdaChart = ({ lostReasons = { reasons: [], totalLost: 0 } }) => {

    const { reasons, totalLost } = lostReasons;

    console.log('Dados recebidos no MotivosPerdaChart:', { reasons, totalLost });

    if (!Array.isArray(reasons) || reasons.length === 0) {
        return (
            <div className="text-center text-gray-500 py-10">
                Nenhum motivo de perda encontrado no período
            </div>
        );
    }
    
    // Normalização robusta para match (remove acentos, minúsculo, espaços simples)
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, ' ');

    const reasonsMap = reasons.reduce((acc, r) => {
        const key = normalize(r.reason || '');  // ← usa "reason" do backend
        acc[key] = {
            count: Number(r.total || 0),
            percent: Number(r.percent || 0),
        };
        return acc;
    }, {});

    let processedData = ALL_LOST_REASONS.map(reason => {
        const normalizedField = normalize(reason.field || '');
        const matched = reasonsMap[normalizedField] || { count: 0, percent: 0 };
        const count = matched.count;
        const percent = totalLost > 0 ? (count / totalLost * 100).toFixed(1) : 0;

        return {
            ...reason,
            count,
            percent,
        };
    });

    // Ordenação dinâmica (ativos no topo, decrescente por count)
    let sortableData = [...processedData]; 
    sortableData.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    // Dimensionamento dinâmico
    const MAX_WIDTH = 96; 
    const REDUCTION_STEP = 8; 
    const MIN_ACTIVE_WIDTH = 25; 

    let activeIndexCounter = 0;
    const finalChartData = sortableData.map((item) => {
        const isActive = item.count > 0;
        let widthPercent;

        if (isActive) {
            const calculatedWidth = MAX_WIDTH - (activeIndexCounter * REDUCTION_STEP);
            widthPercent = Math.max(MIN_ACTIVE_WIDTH, calculatedWidth); 
            activeIndexCounter++; 
        } else {
            widthPercent = 12; 
        }
        
        return {
            ...item,
            widthPercent,
            isActive
        };
    });

    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="flex flex-col items-center p-4 pt-0">
            
            <h3 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-8">
                Motivos de Perda
            </h3>

            <div className="w-full max-w-3xl space-y-3">
                {finalChartData.map((item, index) => {
                    
                    const isActive = item.isActive;
                    
                    return (
                        <motion.div
                            key={item.field}
                            initial={{ opacity: 0, x: -60 }}
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: index * 0.08, duration: 0.5 }} 
                            className="w-full h-12 rounded-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                            style={{ 
                                background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            }}
                        >
                            {/* Barra Colorida */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.widthPercent}%` }}
                                transition={{ duration: 0.9, delay: index * 0.1, ease: "easeOut" }}
                                className="h-full absolute top-0 left-0 rounded-xl"
                                style={{
                                    backgroundImage: isActive ? `
                                        linear-gradient(to right, 
                                            ${item.colorLight} 0%, 
                                            ${item.color} 50%, 
                                            ${item.color} 100%
                                        ),
                                        radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)
                                    ` : 'none',
                                    backgroundColor: isActive ? item.color : 'transparent',
                                    boxShadow: isActive ? item.shadow + ', inset 0 4px 12px rgba(255,255,255,0.3)' : 'none',
                                    opacity: isActive ? 1 : 0.4,
                                }}
                            />

                            {/* Conteúdo */}
                            <div className="relative z-10 h-full flex items-center justify-between px-5">
                                <span 
                                    className="text-base font-bold truncate"
                                    style={{
                                        color: isActive ? 'white' : (isDarkMode ? '#E5E7EB' : '#4B5563'),
                                        textShadow: isActive ? '0 2px 4px rgba(0,0,0,0.7)' : 'none',
                                    }}
                                >
                                    {item.name}
                                </span>                         
                                <div className="flex items-baseline gap-2" style={{ textShadow: isActive ? '0 2px 4px rgba(0,0,0,0.7)' : 'none' }}>
                                    <span className={`text-xl font-extrabold ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {item.count}
                                    </span>
                                    <span className={`text-base font-semibold ${isActive ? 'text-white opacity-90' : 'text-gray-500 dark:text-gray-400'}`}>
                                        ({item.percent.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Total */}
            <div className="text-center mt-8 pt-6 border-t border-gray-300 dark:border-gray-600 w-full max-w-3xl">
                <div className="text-4xl font-extrabold text-red-600 dark:text-red-400">
                    {totalLost}
                </div>
                <div className="text-base text-gray-600 dark:text-gray-400">Total de leads perdidos no período</div>
            </div>
        </div>
    );
};

export default MotivosPerdaChart;