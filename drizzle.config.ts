import { defineConfig } from "drizzle-kit";
// import { DATABASE_URL } from "astro:env/server";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
