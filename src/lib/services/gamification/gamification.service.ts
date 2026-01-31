import type { SupabaseClient } from "../../../db/supabase.client";
import type { AnalysisStats } from "@/types";
import { GamificationDatabaseError } from "./gamification.errors";

/**
 * Service for managing gamification features.
 * Tracks user analysis statistics for percentage-based progress display.
 */
export class GamificationService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Records an analysis result (correct or incorrect).
   * Increments total_analyses always, correct_analyses only when isCorrect is true.
   * The RPC uses auth.uid() internally to identify the current user.
   *
   * @param isCorrect - Whether the analysis found no errors
   * @returns The updated analysis statistics
   * @throws GamificationDatabaseError if database operation fails
   */
  async recordAnalysis(isCorrect: boolean): Promise<AnalysisStats> {
    const { data, error } = await this.supabase.rpc("record_analysis", {
      p_is_correct: isCorrect,
    });

    if (error) {
      console.error("Database error in recordAnalysis:", error);
      throw new GamificationDatabaseError(error);
    }

    const row = data?.[0];
    if (!row || typeof row.correct_analyses !== "number" || typeof row.total_analyses !== "number") {
      console.error("Unexpected RPC return type in recordAnalysis:", typeof data, data);
      throw new GamificationDatabaseError(new Error("Invalid response from record_analysis RPC"));
    }

    return {
      correctAnalyses: row.correct_analyses,
      totalAnalyses: row.total_analyses,
    };
  }

  /**
   * Gets the analysis statistics for the current authenticated user.
   * The RPC uses auth.uid() internally to identify the current user.
   *
   * @returns The analysis statistics (correct and total counts)
   * @throws GamificationDatabaseError if database operation fails
   */
  async getAnalysisStats(): Promise<AnalysisStats> {
    const { data, error } = await this.supabase.rpc("get_analysis_stats");

    if (error) {
      console.error("Database error in getAnalysisStats:", error);
      throw new GamificationDatabaseError(error);
    }

    const row = data?.[0];
    if (!row || typeof row.correct_analyses !== "number" || typeof row.total_analyses !== "number") {
      console.error("Unexpected RPC return type in getAnalysisStats:", typeof data, data);
      throw new GamificationDatabaseError(new Error("Invalid response from get_analysis_stats RPC"));
    }

    return {
      correctAnalyses: row.correct_analyses,
      totalAnalyses: row.total_analyses,
    };
  }

  /**
   * Resets analysis statistics for the current authenticated user.
   *
   * @throws GamificationDatabaseError if database operation fails
   */
  async resetAnalysisStats(): Promise<void> {
    const { error } = await this.supabase.rpc("reset_analysis_stats");

    if (error) {
      console.error("Database error in resetAnalysisStats:", error);
      throw new GamificationDatabaseError(error);
    }
  }
}
