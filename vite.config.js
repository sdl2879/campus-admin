import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 解决__dirname在ES模块中的兼容性问题
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    fs: {
      strict: false,
      // 核心添加：允许Vite访问上级目录的文件，解决路径解析限制
      allow: ['..']
    },
    watch: {
      usePolling: true,
      ignored: ['!**/node_modules/**']
    },
    proxy: {
      // 适配后端/api前缀，保留代理规则
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 关键：不删除/api前缀（后端context-path为/api）
        // 可选：如果后端无/api前缀，添加 rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/avatar': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },
  resolve: {
    // 强化别名配置：增加绝对路径兜底
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
      // 兼容常见的其他别名
      'src': path.resolve(__dirname, './src'),
      'views': path.resolve(__dirname, './src/views')
    },
    extensions: ['.mjs', '.js', '.jsx', '.json', '.vue'],
    // 核心添加：禁用条件导入，避免解析冲突
    conditions: [],
    // 核心添加：强制使用模块解析，兼容动态导入
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  optimizeDeps: {
    force: true,
    include: ['vue', 'vue-router', 'element-plus', 'axios'],
    // 核心添加：排除路径别名相关的依赖，避免预构建冲突
    exclude: ['@/views']
  },
  build: {
    minify: false, // 关闭压缩，便于调试
    // 核心添加：确保构建时路径解析正确
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
        }
      }
    }
  },
  // 核心添加：全局配置，确保运行时路径解析正确
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    // 暴露路径别名给运行时
    'process.env.BASE_URL': JSON.stringify('/')
  }
})