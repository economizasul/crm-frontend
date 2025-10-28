/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Sintaxe simplificada e robusta para cobrir src/ e todas as subpastas
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