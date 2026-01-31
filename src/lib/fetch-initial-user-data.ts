import type { SupabaseClient } from "@/db/supabase.client";
import type { UserSettings, AnalysisStats } from "@/types";
import { GamificationService } from "@/lib/services/gamification";
import { SettingsService } from "@/lib/services/settings";

export type InitialUserDataStatus = "ok" | "error" | "unauthenticated";

export interface InitialUserData {
  initialStats: AnalysisStats | null;
  initialSettings: UserSettings | null;
  status: InitialUserDataStatus;
}

/**
 * Fetches initial user data (analysis stats and settings) for authenticated users.
 * Returns status to distinguish unauthenticated from fetch errors.
 *
 * @param supabase - Supabase client instance
 * @returns Object containing initialStats, initialSettings, and status
 */
export async function fetchInitialUserData(supabase: SupabaseClient): Promise<InitialUserData> {
  let initialStats: AnalysisStats | null = null;
  let initialSettings: UserSettings | null = null;
  let hasError = false;

  const [statsResult, settingsResult] = await Promise.allSettled([
    new GamificationService(supabase).getAnalysisStats(),
    new SettingsService(supabase).getUserSettings(),
  ]);

  if (statsResult.status === "fulfilled") {
    initialStats = statsResult.value;
  } else {
    hasError = true;
    console.error("Failed to fetch analysis stats:", statsResult.reason);
  }

  if (settingsResult.status === "fulfilled") {
    initialSettings = settingsResult.value;
  } else {
    hasError = true;
    console.error("Failed to fetch settings:", settingsResult.reason);
  }

  return { initialStats, initialSettings, status: hasError ? "error" : "ok" };
}
