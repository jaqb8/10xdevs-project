import type { SupabaseClient } from "../../../db/supabase.client";
import { DailyQuotaDatabaseError } from "./daily-quota.errors";
import { ANONYMOUS_DAILY_QUOTA, ANONYMOUS_IP_SALT } from "astro:env/server";

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
    const resetAt = this.getNextMidnightUTC();

    const { data, error } = await this.supabase.rpc("increment_anonymous_daily_usage", {
      p_ip_hash: ipHash,
      p_usage_date: today,
      p_limit: ANONYMOUS_DAILY_QUOTA,
    });

    if (error) {
      console.error("Database error in checkAndIncrementAnonymousUsage (rpc):", error);
      throw new DailyQuotaDatabaseError(error);
    }

    const result = data as { allowed: boolean; current_usage: number };

    return {
      allowed: result.allowed,
      remaining: Math.max(0, ANONYMOUS_DAILY_QUOTA - result.current_usage),
      resetAt,
    };
  }

  /**
   * Hashes the IP address using SHA-256 with a salt for privacy protection.
   *
   * @param ip - Client IP address
   * @returns Hashed IP address as hex string
   */
  private async hashIP(ip: string): Promise<string> {
    const salt = ANONYMOUS_IP_SALT;

    if (salt === "default-insecure-salt") {
      console.warn("WARNING: ANONYMOUS_IP_SALT is not set. Using default insecure salt.");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(ip + salt);
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
