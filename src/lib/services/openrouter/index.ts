import { OpenRouterService } from "./openrouter.service";

export const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  siteUrl: import.meta.env.ASTRO_SITE || "http://localhost:3000",
  appName: import.meta.env.APP_NAME || "Language Learning Buddy",
});

export { OpenRouterService } from "./openrouter.service";
export * from "./openrouter.errors";
export * from "./openrouter.types";
