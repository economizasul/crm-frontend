import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🚨 CONFIGURAÇÃO CRÍTICA PARA RESOLUÇÃO DE MÓDULOS
  resolve: {
    alias: {
      // O alias @ agora aponta para a pasta src, garantindo que o caminho seja absoluto
      '@': path.resolve(__dirname, './src'), 
    },
  },

  // Mantendo sua base e build, mas inserindo o 'resolve'
  base: '/',
  build: {
    rollupOptions: {
      external: [], 
    }
  }
});