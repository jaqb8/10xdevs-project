import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

async function globalTeardown() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;
  const testUserId = process.env.E2E_USER_ID!;

  if (!supabaseUrl || !supabaseKey || !testUserId) {
    console.error("Missing Supabase credentials in environment variables");
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME!,
    password: process.env.E2E_PASSWORD!,
  });

  if (signInError) {
    console.error("Error signing in:", signInError);
    throw signInError;
  }

  try {
    console.log("Cleaning up learning_items table...");

    const { error } = await supabase.from("learning_items").delete().eq("user_id", testUserId);

    if (error) {
      console.error("Error cleaning up learning_items:", error);
      throw error;
    }

    console.log("Successfully cleaned up learning_items table");
  } catch (error) {
    console.error("Failed to clean up database:", error);
    throw error;
  }
}

export default globalTeardown;
