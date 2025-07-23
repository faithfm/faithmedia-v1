import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./resources/js/tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/vendor/**'],
    css: {
      include: [/\.css$/],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
    },
  },
})
