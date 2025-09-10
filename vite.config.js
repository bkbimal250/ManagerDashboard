import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://company.d0s369.co.in',
        changeOrigin: true,
        secure: false, // allow self-signed certs (if any)
      },
    },
  },
})
