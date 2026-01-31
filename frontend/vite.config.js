import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5173,  
    proxy: {
      '/api': {
        // ✅ Change this to your live Render URL for local testing
        target: 'https://gopi-nath-collection.onrender.com', 
        changeOrigin: true,
        secure: false, // Useful for some SSL environments
      },
    } 
  } 
})