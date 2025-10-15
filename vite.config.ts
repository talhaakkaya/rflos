import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/rflos/',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['dev.local', 'localhost'],
    strictPort: false,
  }
})

