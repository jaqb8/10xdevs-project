import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";
import { DATABASE_URL } from "astro:env/server";

/**
 * Creates a Drizzle client instance connected to Supabase PostgreSQL database.
 * Uses connection pooler in Transaction mode (requires prepare: false).
 *
 * @returns Drizzle database instance
 */
export function createDrizzleClient() {
  const databaseUrl = DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(databaseUrl, {
    prepare: false,
  });

  return drizzle({ client, schema });
}

export type DrizzleDb = ReturnType<typeof createDrizzleClient>;
