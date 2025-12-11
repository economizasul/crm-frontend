import React from 'react';
import { motion } from 'framer-motion';

// Lista de todos os motivos possíveis com cores e sombras distintas
const ALL_LOST_REASONS = [
    { name: 'Preço/Orçamento', field: 'preco', color: '#DC2626', shadow: '0 4px 12px rgba(220, 38, 38, 0.6)' }, // Vermelho Forte
    { name: 'Concorrência', field: 'concorrencia', color: '#F59E0B', shadow: '0 4px 12px rgba(245, 158, 11, 0.6)' }, // Laranja
    { name: 'Desistência do Cliente', field: 'desistencia', color: '#10B981', shadow: '0 4px 12px rgba(16, 185, 129, 0.6)' }, // Verde Esmeralda
    { name: 'Inapto/Não Qualificado', field: 'inapto', color: '#6B7280', shadow: '0 4px 12px rgba(107, 114, 128, 0.6)' }, // Cinza
    { name: 'Demora na Proposta', field: 'demora', color: '#4F46E5', shadow: '0 4px 12px rgba(79, 70, 229, 0.6)' }, // Índigo
    { name: 'Crédito Negado', field: 'credito', color: '#E11D48', shadow: '0 4px 12px rgba(225, 29, 72, 0.6)' }, // Rosa Escuro
    { name: 'Não Especificado', field: 'nao_especificado', color: '#0EA5E9', shadow: '0 4px 12px rgba(14, 165, 233, 0.6)' }, // Ciano
    // Adicione mais motivos aqui se necessário
];

const MotivosPerdaChart = ({ lostReasons }) => {
    
    const { reasons = [], totalLost = 0 } = lostReasons;
    
    // Converte o array reasons em um objeto de fácil acesso para contagem
    const reasonsMap = reasons.reduce((acc, r) => {
        acc[r.reasonField] = r.count;
        return acc;
    }, {});

    // 1. Mapeia todos os motivos possíveis (ALL_LOST_REASONS)
    // 2. Adiciona a contagem real ou 0
    // 3. Adiciona a porcentagem de perda
    const chartData = ALL_LOST_REASONS.map(reason => {
        const count = reasonsMap[reason.field] || 0;
        const percent = totalLost > 0 ? (count / totalLost) * 100 : 0;
        
        return {
            ...reason,
            count: count,
            percent: percent,
        };
    });

    const isDarkMode = document.documentElement.classList.contains('dark'); // Verifica modo escuro

    return (
        <div className="flex flex-col items-center p-2 pt-0">
            
            {/* Título (Único) */}
            <h3 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">
                Motivos de Perda
            </h3>

            {/* Container das Barras */}
            <div className="w-full space-y-3">
                {chartData.map((item, index) => {
                    
                    // Lógica para destacar:
                    const isActive = item.count > 0;
                    const widthPercent = isActive ? Math.max(20, item.percent) : 100; // Barras ativas têm largura mínima de 20%, inativas 100%
                    
                    // Opacidade: Itens sem valor ficam desbotados
                    const opacity = isActive ? 1 : 0.4;
                    
                    // Cor de Fundo: Para itens inativos
                    const inactiveBg = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                    
                    return (
                        <motion.div
                            key={item.field}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: opacity, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="w-full h-10 rounded-lg relative overflow-hidden transition-all duration-300"
                            style={{ 
                                background: inactiveBg,
                                opacity: opacity,
                            }}
                        >
                            {/* Barra Colorida (FUNDO) */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPercent}%` }}
                                transition={{ duration: 0.8, delay: index * 0.15 }}
                                className="h-full absolute top-0 left-0 rounded-lg"
                                style={{
                                    backgroundColor: item.color,
                                    boxShadow: isActive ? item.shadow : 'none',
                                    // Efeito 3D sutil (opcional)
                                    backgroundImage: `linear-gradient(to right, ${item.color}, ${item.color} 80%, rgba(255,255,255,0.2) 100%)`,
                                }}
                            />

                            {/* Conteúdo (Nome e Valores) */}
                            <div className="relative z-10 h-full flex items-center justify-between px-3 text-white">
                                
                                {/* Nome do Motivo (Sempre visível e em destaque) */}
                                <span 
                                    className="text-sm font-semibold truncate"
                                    style={{
                                        color: isActive ? 'white' : (isDarkMode ? '#E5E7EB' : '#4B5563'),
                                        textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                                    }}
                                >
                                    {item.name}
                                </span>

                                {/* Valores (Visíveis apenas se ativos) */}
                                {isActive && (
                                    <div className="flex items-baseline gap-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                        <span className="text-lg font-bold">{item.count}</span>
                                        <span className="text-sm font-medium">{item.percent.toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Valores Inativos (Aparecem fora da barra colorida) */}
                            {!isActive && (
                                <div className="absolute right-3 top-0 h-full flex items-center">
                                     <span className="text-sm font-semibold text-gray-500">0 (0.0%)</span>
                                </div>
                            )}

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