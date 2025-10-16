import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    // 🚨 1. Mantém o alias @/ como fallback (se o seu Dashboard.jsx usar @/Sidebar)
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
    
    // 🚨 2. ADICIONA .jsx e .js para resolução automática de arquivos
    // Isso garante que ele tente carregar "Sidebar.jsx" ou "Sidebar.js" se for importado como "Sidebar"
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },

  base: '/',
  build: {
    rollupOptions: {
      external: [], 
    }
  }
});