import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    hmr: {
      port: parseInt(process.env.PORT) + 2000, 
    }
  },
  root: './src', 
  build: {
    outDir: '../dist', 
  },
  publicDir: '../public' 
})
