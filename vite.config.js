import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // CORREÇÃO PARA O ERRO DE BUILD DO AXIOS NO RENDER/VITE
  build: {
    rollupOptions: {
      // Garante que o Rollup não tente externalizar módulos cruciais como o axios
      external: [], 
    }
  }
})