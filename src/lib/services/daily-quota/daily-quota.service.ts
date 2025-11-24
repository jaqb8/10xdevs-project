import type { SupabaseClient } from "../../../db/supabase.client";
import { DailyQuotaDatabaseError } from "./daily-quota.errors";

const ANONYMOUS_DAILY_QUOTA =
  typeof import.meta.env !== "undefined" && import.meta.env.ANONYMOUS_DAILY_QUOTA
    ? Number(import.meta.env.ANONYMOUS_DAILY_QUOTA)
    : 5;

/**
 * Service for managing daily analysis quota for unauthenticated users.
 * Tracks usage by hashed IP address to protect user privacy.
 */
export class DailyQuotaService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Checks if the request is allowed and increments the usage counter atomically.
   *
   * @param ip - Client IP address (will be hashed internally)
   * @returns Object with `allowed` boolean, `remaining` count, and `resetAt` timestamp
   * @throws DailyQuotaDatabaseError if database operation fails
   */
  async checkAndIncrementAnonymousUsage(ip: string): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
    const ipHash = await this.hashIP(ip);
    const today = this.getTodayUTC();

    const { data: existingRecord, error: selectError } = await this.supabase
      .from("anonymous_daily_usage")
      .select("request_count")
      .eq("ip_hash", ipHash)
      .eq("usage_date", today)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Database error in checkAndIncrementAnonymousUsage (select):", selectError);
      throw new DailyQuotaDatabaseError(selectError);
    }

    const currentCount = existingRecord?.request_count ?? 0;

    const resetAt = this.getNextMidnightUTC();

    if (currentCount >= ANONYMOUS_DAILY_QUOTA) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    const newCount = currentCount + 1;

    const { error: upsertError } = await this.supabase.from("anonymous_daily_usage").upsert(
      {
        ip_hash: ipHash,
        usage_date: today,
        request_count: newCount,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "ip_hash,usage_date",
      }
    );

    if (upsertError) {
      console.error("Database error in checkAndIncrementAnonymousUsage (upsert):", upsertError);
      throw new DailyQuotaDatabaseError(upsertError);
    }

    return {
      allowed: true,
      remaining: Math.max(0, ANONYMOUS_DAILY_QUOTA - newCount),
      resetAt,
    };
  }

  /**
   * Hashes the IP address using SHA-256 for privacy protection.
   *
   * @param ip - Client IP address
   * @returns Hashed IP address as hex string
   */
  private async hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Gets today's date in UTC as YYYY-MM-DD format.
   *
   * @returns Today's date string
   */
  private getTodayUTC(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets the next midnight UTC timestamp as ISO string.
   * This represents when the daily quota will reset.
   *
   * @returns ISO timestamp string of next midnight UTC
   */
  private getNextMidnightUTC(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }
}
