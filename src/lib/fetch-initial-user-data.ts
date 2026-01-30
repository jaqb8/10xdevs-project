import type { SupabaseClient } from "@/db/supabase.client";
import type { UserSettings } from "@/types";
import { GamificationService } from "@/lib/services/gamification";
import { SettingsService } from "@/lib/services/settings";

export type InitialUserDataStatus = "ok" | "error" | "unauthenticated";

export interface InitialUserData {
  initialPoints: number | null;
  initialSettings: UserSettings | null;
  status: InitialUserDataStatus;
}

/**
 * Fetches initial user data (points and settings) for authenticated users.
 * Returns status to distinguish unauthenticated from fetch errors.
 *
 * @param supabase - Supabase client instance
 * @returns Object containing initialPoints, initialSettings, and status
 */
export async function fetchInitialUserData(supabase: SupabaseClient): Promise<InitialUserData> {
  let initialPoints: number | null = null;
  let initialSettings: UserSettings | null = null;
  let hasError = false;

  const [pointsResult, settingsResult] = await Promise.allSettled([
    new GamificationService(supabase).getUserPointsTotal(),
    new SettingsService(supabase).getUserSettings(),
  ]);

  if (pointsResult.status === "fulfilled") {
    initialPoints = pointsResult.value;
  } else {
    hasError = true;
    console.error("Failed to fetch points:", pointsResult.reason);
  }

  if (settingsResult.status === "fulfilled") {
    initialSettings = settingsResult.value;
  } else {
    hasError = true;
    console.error("Failed to fetch settings:", settingsResult.reason);
  }

  return { initialPoints, initialSettings, status: hasError ? "error" : "ok" };
}
