import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/login': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/register': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/google-login': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    }
  }
})
