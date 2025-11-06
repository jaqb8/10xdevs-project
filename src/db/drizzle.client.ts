import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";
import { DATABASE_URL } from "astro:env/server";

let drizzleClient: ReturnType<typeof drizzle> | null = null;

/**
 * Gets or creates a singleton Drizzle client instance connected to Supabase PostgreSQL database.
 * Uses connection pooler in Transaction mode (requires prepare: false).
 * Reuses the same client instance across all requests to prevent connection pool exhaustion.
 *
 * @returns Drizzle database instance
 */
export function createDrizzleClient() {
  if (drizzleClient) {
    return drizzleClient;
  }

  const databaseUrl = DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(databaseUrl, {
    prepare: false,
  });

  drizzleClient = drizzle({ client, schema });
  return drizzleClient;
}

export type DrizzleDb = ReturnType<typeof createDrizzleClient>;
