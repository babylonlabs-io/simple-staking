import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        404: resolve(__dirname, "404.html"),
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({ include: ["buffer"] }),
    EnvironmentPlugin("all", { prefix: "NEXT_PUBLIC_" }),
  ],
  define: {
    "import.meta.env.NEXT_PUBLIC_COMMIT_HASH": JSON.stringify(
      process.env.NEXT_PUBLIC_COMMIT_HASH || "development",
    ),
  },
});
