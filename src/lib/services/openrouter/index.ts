import { OpenRouterService } from "./openrouter.service";
import { OPENROUTER_API_KEY, ASTRO_SITE, APP_NAME, USE_MOCKS } from "astro:env/server";

export const openRouterService = new OpenRouterService({
  apiKey: USE_MOCKS ? "mock-api-key" : OPENROUTER_API_KEY,
  siteUrl: ASTRO_SITE,
  appName: APP_NAME,
});

export { OpenRouterService } from "./openrouter.service";
export * from "./openrouter.errors";
export * from "./openrouter.types";
