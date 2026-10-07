import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  // Server code reads secrets (e.g. SUPABASE_SERVICE_ROLE_KEY) from process.env.
  // In `npm run dev` load them from .env; in Docker they come from compose.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
    process.env[key] ??= value;
  }

  return {
    server: { host: true, port: 3000 },
    preview: { port: 3000 },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Use src/server.ts (our SSR error wrapper) as the server entry.
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      // Builds a standalone Node server into .output/ (run with `node .output/server/index.mjs`).
      nitro({ preset: "node-server" }),
      viteReact(),
    ],
  };
});
