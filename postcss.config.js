// postcss.config.js - Conteúdo CORRIGIDO

// Agora, usamos a sintaxe ESM (export default) que é compatível com "type": "module"
export default {
  plugins: {
    // ✅ CORREÇÃO: Usar o plugin oficial do PostCSS para Tailwind
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};