import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/admin/', // ✅ MUST match the basename in App.jsx
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})