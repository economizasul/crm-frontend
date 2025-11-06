cat > src/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': '/opt/render/project/src'  // ← ENDEREÇO ABSOLUTO FORÇADO (FUNCIONA NO RENDER)
    }
  }
})
EOF