/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // ✅ Alteração: Forçando o Tailwind a ler todos os arquivos dentro de src/
    "./src/*.{js,ts,jsx,tsx}", // Lê arquivos como App.jsx, KanbanBoard.jsx
    "./src/**/*.{js,ts,jsx,tsx}", // Mantém o wildcard para subpastas (components)
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