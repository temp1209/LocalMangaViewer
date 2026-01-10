import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // 出力先（Vite設定のoutDirに相当。デフォルトもdistです）
  outDir: './dist',
  output: 'server',
  // 開発サーバーの設定
  server: {
    port: 5173,
  },

  // Vite固有の設定（プロキシやパス解決など）
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          // rewriteはVite設定と同じ挙動なら省略可能ですが、明示的に残すこともできます
          rewrite: (path) => path,
        },
        "/files": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path,
        }
      },
      fs:{
        allow:[".."]
      }
    },
    resolve:{
      alias:{
        "@comic-viewer/shared":"../shared/src/index.ts"
      }
    }
  },
});