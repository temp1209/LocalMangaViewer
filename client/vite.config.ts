import { defineConfig } from "vite";
import path from "path";

const pagesPath = path.resolve(__dirname,"src","pages");

export default defineConfig({
  root: path.resolve(__dirname, "src"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist"),
    rollupOptions: {
      input: {
        mangaList: path.resolve(pagesPath, "mangaList", "mangaList.html"),
        tagList: path.resolve(pagesPath, "tagList", "tagList.html"),
        upload: path.resolve(pagesPath, "upload", "upload.html"),
        viewer: path.resolve(pagesPath, "viewer", "viewer.html"),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
