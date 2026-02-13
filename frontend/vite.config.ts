import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/login': 'http://localhost:5001',
      '/register': 'http://localhost:5001',
      '/api': 'http://localhost:5001',
    }
  }
})
