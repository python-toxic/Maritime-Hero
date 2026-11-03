import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import routerPlugin from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [routerPlugin(), react()],
  base: '/Insights/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
});
