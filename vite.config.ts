import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { compression } from "vite-plugin-compression2";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    compression(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Floussly",
        short_name: "Floussly",
        description: "A modern web application for managing your finances",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@components": path.resolve(__dirname, "client/src/components"),
      "@pages": path.resolve(__dirname, "client/src/pages"),
      "@services": path.resolve(__dirname, "client/src/services"),
      "@utils": path.resolve(__dirname, "client/src/utils"),
      "@hooks": path.resolve(__dirname, "client/src/hooks"),
      "@context": path.resolve(__dirname, "client/src/context"),
      "@types": path.resolve(__dirname, "client/src/types"),
      "@assets": path.resolve(__dirname, "client/src/assets"),
      "@styles": path.resolve(__dirname, "client/src/styles"),
      "@config": path.resolve(__dirname, "client/src/config"),
      "@constants": path.resolve(__dirname, "client/src/constants"),
      "@features": path.resolve(__dirname, "client/src/features"),
    },
  },
  root: path.resolve(__dirname, "client"),
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          socket: ["socket.io-client"],
          i18n: ["i18next", "react-i18next"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          utils: ["date-fns", "lodash", "zod"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "socket.io-client",
      "i18next",
      "react-i18next",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "date-fns",
      "lodash",
      "zod",
    ],
  },
});
