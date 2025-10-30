import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getAuthenticatedSupabaseClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in environment variables");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME!,
    password: process.env.E2E_PASSWORD!,
  });

  if (signInError) {
    throw signInError;
  }

  return supabase;
}

export async function clearLearningItems() {
  const testUserId = process.env.E2E_USER_ID!;

  if (!testUserId) {
    throw new Error("Missing E2E_USER_ID in environment variables");
  }

  const supabase = await getAuthenticatedSupabaseClient();

  const { error } = await supabase.from("learning_items").delete().eq("user_id", testUserId);

  if (error) {
    throw error;
  }
}
