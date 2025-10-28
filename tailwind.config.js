/** @type {import('tailwindcss').Config} */
export default {
  // CORREÇÃO CRÍTICA: Sintaxe simplificada e robusta.
  // O **.{extensao} cobre todos os arquivos e subpastas dentro de src/.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'econ-roxo': '#4f46e5',
      }
    },
  },
  plugins: [],
}