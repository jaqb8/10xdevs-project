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
  devToolbar: {
    enabled: false,
  },
  server: { port: 3000 },
  env: {
    schema: {
      PUBLIC_ENV_NAME: envField.string({ context: "client", access: "public" }),
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_PUBLIC_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_API_KEY: envField.string({ context: "server", access: "secret", default: "mock-api-key" }),
      POSTHOG_PROJECT_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      POSTHOG_HOST: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "https://eu.i.posthog.com",
      }),
      POSTHOG_DISABLED: envField.boolean({ context: "server", access: "public", optional: true, default: false }),
      PUBLIC_POSTHOG_PROJECT_API_KEY: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_POSTHOG_HOST: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "https://eu.i.posthog.com",
      }),
      PUBLIC_POSTHOG_DISABLED: envField.boolean({
        context: "client",
        access: "public",
        optional: true,
        default: false,
      }),
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
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : undefined,
    },
  },
  adapter: cloudflare(),
});
