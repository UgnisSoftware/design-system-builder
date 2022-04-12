import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: "_lapeViteJSX",
    jsxFragment: "Fragment",
    jsxInject: `import { _lapeViteJSX } from 'lape'; import { Fragment } from 'react';`,
  },
  plugins: [tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react"],
          "react-dom": ["react-dom"],
        },
      },
    },
  },
});
