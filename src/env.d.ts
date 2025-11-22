/// <reference types="astro/client" />

import type { SupabaseClient } from "./db/supabase.client.ts";
import type { UserViewModel } from "./types.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: UserViewModel | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly USE_MOCKS?: string;
  readonly RATE_LIMIT_MAX_REQUESTS?: string;
  readonly RATE_LIMIT_WINDOW_MS?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
