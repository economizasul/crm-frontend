// postcss.config.js - Configuração FINAL e CORRETA para Tailwind V4

export default {
  plugins: {
    // CRÍTICO: Use o nome do plugin V4 instalado para resolver o erro de build
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};