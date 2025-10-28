// postcss.config.js - Estratégia Híbrida V3/V4

export default {
  plugins: {
    // 🛑 VOLTAMOS A USAR O NOME ANTIGO (V3)
    // Se o motor V4 já estiver instalado (como está no seu package.json), 
    // ele pode aceitar esta sintaxe para forçar o build.
    'tailwindcss': {}, 
    autoprefixer: {},
  },
};