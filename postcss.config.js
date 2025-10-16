// Exportamos o módulo para garantir que o ambiente de build o encontre.
module.exports = {
  plugins: [
    // Usamos 'require' para carregar os plugins de forma direta, ignorando conflitos de sintaxe ESM.
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};