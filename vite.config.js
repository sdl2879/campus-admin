// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000, // 核心修改：从8080改为3000（或8081/8090）
    host: '0.0.0.0',
    open: true,
    // 代理配置：target指向后端实际端口（比如后端改到8081，就写8081）
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端端口（若后端仍用8080，就写8080）
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})