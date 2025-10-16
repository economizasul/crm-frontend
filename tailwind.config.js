/** @type {import('tailwindcss').Config} */
export default {
  // CONFIGURAÇÃO ESSENCIAL: Diz ao Tailwind onde procurar as classes.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Inclui todos os arquivos .jsx na pasta src
  ],
  theme: {
    extend: {
      // Adicione cores ou fontes customizadas aqui, se necessário
      colors: {
        'econ-roxo': '#4f46e5', // Exemplo de cor customizada
      }
    },
  },
  plugins: [],
}