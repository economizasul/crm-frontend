/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 1. Arquivo HTML principal
    "./index.html",
    
    // 2. Simplificar para cobrir TODAS as subpastas e arquivos
    // Isso cobre 'src/App.jsx', 'src/components/Sidebar.jsx', etc.
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