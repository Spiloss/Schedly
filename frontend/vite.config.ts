import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Questo abilita il supporto a React e al Refresh veloce
  plugins: [react()],
  server: {
    port: 5173, // La porta standard del frontend
  }
})