import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import syncHandler from "./api/sync.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const installSyncMiddleware = (server, loadedEnv) => {
    server.middlewares.use("/api/sync", (req, res, next) => {
      if (!["GET", "POST", "OPTIONS"].includes(req.method)) {
        return next();
      }

      if (!process.env.SUPABASE_URL && loadedEnv.SUPABASE_URL) {
        process.env.SUPABASE_URL = loadedEnv.SUPABASE_URL;
      }
      if (!process.env.SUPABASE_SECRET_KEY && loadedEnv.SUPABASE_SECRET_KEY) {
        process.env.SUPABASE_SECRET_KEY = loadedEnv.SUPABASE_SECRET_KEY;
      }

      return syncHandler(req, res);
    });
  };

  return {
    plugins: [
      react(),
      {
        name: "local-supabase-api",
        configureServer(server) {
          installSyncMiddleware(server, env);
        },
        configurePreviewServer(server) {
          installSyncMiddleware(server, env);
        },
      },
    ],
    base: "./",
  };
});
