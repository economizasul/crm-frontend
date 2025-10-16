// Agora, usamos a sintaxe ESM (export default) que é compatível com "type": "module"
export default {
  plugins: [
    // Usamos o require() dentro do array plugins (que é o formato que o PostCSS espera)
    // Se isso falhar, a sintaxe alternativa deve ser usada (próximo passo, se necessário)
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};