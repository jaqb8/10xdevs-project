import type { SupabaseClient } from "@/db/supabase.client";
import type { UserSettings } from "@/types";
import { GamificationService } from "@/lib/services/gamification";
import { SettingsService } from "@/lib/services/settings";

export interface InitialUserData {
  initialPoints: number | null;
  initialSettings: UserSettings | null;
}

/**
 * Fetches initial user data (points and settings) for authenticated users.
 * Returns null values if user is not authenticated or if fetching fails.
 *
 * @param supabase - Supabase client instance
 * @returns Object containing initialPoints and initialSettings, or null values on error
 */
export async function fetchInitialUserData(supabase: SupabaseClient): Promise<InitialUserData> {
  let initialPoints: number | null = null;
  let initialSettings: UserSettings | null = null;

  try {
    const [points, settings] = await Promise.all([
      new GamificationService(supabase).getUserPointsTotal(),
      new SettingsService(supabase).getUserSettings(),
    ]);
    initialPoints = points;
    initialSettings = settings;
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
  }

  return { initialPoints, initialSettings };
}
