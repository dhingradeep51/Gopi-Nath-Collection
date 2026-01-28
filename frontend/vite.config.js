import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This exposes the project to your network
    port: 5173,  // Default Vite port
    proxy: {
      // This matches the '/api/v1' used in your backend routes
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080', // Backend Server Port
        changeOrigin: true,
      },
    } // Added missing brace for proxy
  } // Added missing brace for server
})