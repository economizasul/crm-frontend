// Garante que o PostCSS configure o Tailwind para o seu build.
export default {
  plugins: {
    // ✅ CORREÇÃO: Usamos o nome do pacote 'tailwindcss' como chave, 
    // com um objeto vazio como valor. Esta é a sintaxe preferida para Vite/PostCSS.
    tailwindcss: {},
    autoprefixer: {},
  },
};