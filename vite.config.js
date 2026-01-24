// 引入Vite核心方法和Vue插件（确保引入路径正确，无拼写错误）
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 引入path模块（Node内置模块，用于处理文件路径，无需额外安装）
import path from 'path'

// 核心配置：用defineConfig包裹所有配置，避免语法错误
// 确保所有括号、逗号闭合，关键字无拼写错误（这是解决报错的关键）
export default defineConfig({
  // 配置Vue插件，确保Vue项目正常运行
  plugins: [vue()],
  // 路径别名配置（保留你原有需求，解决@符号无法解析问题）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // __dirname 自动指向项目根目录，无需手动修改路径
    }
  },
  // 保留之前的关键配置：排除图标库预构建，解决Logout图标导出错误
  optimizeDeps: {
    exclude: ['@element-plus/icons-vue']
  }
})