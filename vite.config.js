import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // CORREÇÃO CRUCIAL: Define a base do aplicativo para a raiz (/)
  base: '/',
  
  build: {
    rollupOptions: {
      // Mantém a correção do axios
      external: [], 
    }
  }
})