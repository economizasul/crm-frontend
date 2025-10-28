/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Sintaxe mais segura para ler TODA a pasta src/
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