// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  env: {
    schema: {
      PUBLIC_ENV_NAME: envField.string({ context: "client", access: "public" }),
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_PUBLIC_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_API_KEY: envField.string({ context: "server", access: "secret" }),
      ASTRO_SITE: envField.string({ context: "server", access: "public", default: "http://localhost:3000" }),
      APP_NAME: envField.string({ context: "server", access: "public", default: "Language Learning Buddy" }),
      USE_MOCKS: envField.boolean({ context: "server", access: "public", default: true }),
      RATE_LIMIT_MAX_REQUESTS: envField.number({ context: "server", access: "public", default: 10 }),
      RATE_LIMIT_WINDOW_MS: envField.number({ context: "server", access: "public", default: 60000 }),
    },
    validateSecrets: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
});
