import { defineConfig } from "vite";

// 相对 base：站点部署在 /ComputerLearning/ 这类子路径下也能正确加载资源。
export default defineConfig({
  base: "./",
  server: {
    port: 5180,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
