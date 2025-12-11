import React from 'react';
import { motion } from 'framer-motion';

// NOVOS MOTIVOS DE PERDA com cores e campos
const ALL_LOST_REASONS = [
    { name: 'Oferta Melhor', field: 'oferta_melhor', color: '#DC2626', shadow: '0 4px 12px rgba(220, 38, 38, 0.6)' },
    { name: 'Incerteza', field: 'incerteza', color: '#F59E0B', shadow: '0 4px 12px rgba(245, 158, 11, 0.6)' },
    { name: 'Geração Própria', field: 'geracao_propria', color: '#10B981', shadow: '0 4px 12px rgba(16, 185, 129, 0.6)' },
    { name: 'Burocracia', field: 'burocracia', color: '#4F46E5', shadow: '0 4px 12px rgba(79, 70, 229, 0.6)' },
    { name: 'Contrato', field: 'contrato', color: '#9333EA', shadow: '0 4px 12px rgba(147, 51, 234, 0.6)' },
    { name: 'Restrições Técnicas', field: 'restricoes_tecnicas', color: '#3B82F6', shadow: '0 4px 12px rgba(59, 130, 246, 0.6)' },
    { name: 'Não é o Responsável', field: 'nao_responsavel', color: '#F472B6', shadow: '0 4px 12px rgba(244, 114, 182, 0.6)' },
    { name: 'Silêncio', field: 'silencio', color: '#6B7280', shadow: '0 4px 12px rgba(107, 114, 128, 0.6)' },
    { name: 'Já Possui GD', field: 'ja_possui_gd', color: '#EAB308', shadow: '0 4px 12px rgba(234, 179, 8, 0.6)' },
    { name: 'Outro Estado', field: 'outro_estado', color: '#14B8A6', shadow: '0 4px 12px rgba(20, 184, 166, 0.6)' },
];

const MotivosPerdaChart = ({ lostReasons }) => {
    
    const { reasons = [], totalLost = 0 } = lostReasons;
    
    const reasonsMap = reasons.reduce((acc, r) => {
        acc[r.reasonField] = r.count;
        return acc;
    }, {});

    const processedData = ALL_LOST_REASONS.map(reason => {
        const count = reasonsMap[reason.field] || 0;
        const percent = totalLost > 0 ? (count / totalLost) * 100 : 0;
        
        return {
            ...reason,
            count: count,
            percent: percent,
        };
    });

    // 🛑 1. ORDENAÇÃO DINÂMICA:
    // Critério 1: Ativos (count > 0) vêm antes dos Inativos (count = 0).
    // Critério 2 (Ativos): Ordenados por valor (maior para menor).
    // Critério 3 (Inativos): Ordenados por nome em ordem alfabética.
    const sortedData = processedData.sort((a, b) => {
        const aActive = a.count > 0;
        const bActive = b.count > 0;

        if (aActive && !bActive) return -1; // A é ativo, B é inativo -> A vem primeiro
        if (!aActive && bActive) return 1;  // A é inativo, B é ativo -> B vem primeiro

        // Se ambos são ativos, ordena por valor (maior para menor)
        if (aActive && bActive) return b.count - a.count;

        // Se ambos são inativos, ordena por nome (A-Z)
        return a.name.localeCompare(b.name);
    });

    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Lógica de Dimensionamento Dinâmico (5% de diferença)
    const MAX_WIDTH = 95; // Largura máxima da maior barra
    const MIN_ACTIVE_WIDTH = 25; // Largura mínima para uma barra ativa
    const INACTIVE_WIDTH = 10; // Largura fixa para barras inativas (10%)
    const REDUCTION_STEP = 5; // Redução de 5% para cada posição abaixo na lista de ativos

    // 🛑 2. CÁLCULO DE LARGURA: Agora baseado na posição APÓS a ordenação
    const finalChartData = sortedData.map((item, index) => {
        const isActive = item.count > 0;
        let widthPercent;

        if (isActive) {
            // Conta quantos itens ativos vieram antes deste (para calcular o offset de 5%)
            const activeIndex = sortedData.filter(r => r.count > 0).findIndex(r => r.field === item.field);
            const calculatedWidth = MAX_WIDTH - (activeIndex * REDUCTION_STEP);
            widthPercent = Math.max(MIN_ACTIVE_WIDTH, calculatedWidth);
            
            // Tratamento de 100%: Se for a única barra ativa, ela ocupa 95%
            if (activeReasons.length === 1 && item.count > 0) {
                widthPercent = MAX_WIDTH;
            }

        } else {
            widthPercent = INACTIVE_WIDTH; // Barras inativas com tamanho fixo de 10%
        }
        
        return {
            ...item,
            widthPercent: widthPercent,
        };
    });

    return (
        <div className="flex flex-col items-center p-2 pt-0">
            
            <h3 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">
                Motivos de Perda
            </h3>

            <div className="w-full space-y-2">
                {finalChartData.map((item, index) => {
                    
                    const isActive = item.count > 0;
                    
                    // Opacidade: Itens sem valor ficam desbotados
                    const opacity = isActive ? 1 : 0.4;
                    
                    // Cor de Fundo: Para itens inativos
                    const inactiveBg = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                    
                    // Cor do Texto: Branco para ativos
                    const textActiveColor = 'white';
                    const textInactiveColor = isDarkMode ? '#E5E7EB' : '#4B5563';

                    return (
                        <motion.div
                            key={item.field}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: opacity, x: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.4 }} 
                            className="w-full h-8 rounded-lg relative overflow-hidden transition-all duration-300"
                            style={{ 
                                background: inactiveBg,
                                // Aplica a opacidade ao container, garantindo que tudo desbote
                                opacity: opacity, 
                            }}
                        >
                            {/* Barra Colorida (FUNDO) */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.widthPercent}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="h-full absolute top-0 left-0 rounded-lg"
                                style={{
                                    backgroundColor: item.color,
                                    boxShadow: isActive ? item.shadow : 'none',
                                    backgroundImage: `linear-gradient(to right, ${item.color}, ${item.color} 80%, rgba(255,255,255,0.2) 100%)`,
                                }}
                            />

                            {/* Conteúdo (Nome e Valores) */}
                            <div className="relative z-10 h-full flex items-center justify-between px-3">
                                
                                {/* Nome do Motivo */}
                                <span 
                                    className="text-sm font-semibold truncate"
                                    style={{
                                        // Cor do texto: Branco para barras ativas
                                        color: isActive ? textActiveColor : textInactiveColor,
                                        textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                                    }}
                                >
                                    {item.name}
                                </span>

                                {/* Valores */}
                                <div className="flex items-baseline gap-1" style={{ textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.6)' : 'none' }}>
                                    <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {item.count}
                                    </span>
                                    <span className={`text-sm font-medium ${isActive ? 'text-white opacity-90' : 'text-gray-500 dark:text-gray-400'}`}>
                                        ({item.percent.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>

                        </motion.div>
                    );
                })}
            </div>
            
            {/* Total */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
                <div className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                    {totalLost}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de leads perdidos no período</div>
            </div>
        </div>
    );
};

export default MotivosPerdaChart;