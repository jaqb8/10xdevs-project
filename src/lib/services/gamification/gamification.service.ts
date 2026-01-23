import type { SupabaseClient } from "../../../db/supabase.client";
import { GamificationDatabaseError } from "./gamification.errors";

/**
 * Service for managing gamification features like points.
 * Tracks user achievements and progress.
 */
export class GamificationService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Records a point for a correct analysis.
   * Called when user successfully analyzes text without errors.
   * Uses atomic upsert to increment the user's points counter.
   * The RPC uses auth.uid() internally to identify the current user.
   *
   * @returns The new total points after increment
   * @throws GamificationDatabaseError if database operation fails
   */
  async recordCorrectAnalysis(): Promise<number> {
    const { data, error } = await this.supabase.rpc("increment_user_points");

    if (error) {
      console.error("Database error in recordCorrectAnalysis:", error);
      throw new GamificationDatabaseError(error);
    }

    if (typeof data !== "number") {
      console.error("Unexpected RPC return type in recordCorrectAnalysis:", typeof data, data);
      throw new GamificationDatabaseError(new Error("Invalid response from increment_user_points RPC"));
    }

    return data;
  }

  /**
   * Gets the total number of points for the current authenticated user.
   * The RPC uses auth.uid() internally to identify the current user.
   *
   * @returns The total number of points
   * @throws GamificationDatabaseError if database operation fails
   */
  async getUserPointsTotal(): Promise<number> {
    const { data, error } = await this.supabase.rpc("get_user_points_total");

    if (error) {
      console.error("Database error in getUserPointsTotal:", error);
      throw new GamificationDatabaseError(error);
    }

    if (typeof data !== "number") {
      console.error("Unexpected RPC return type in getUserPointsTotal:", typeof data, data);
      throw new GamificationDatabaseError(new Error("Invalid response from get_user_points_total RPC"));
    }

    return data;
  }
}
