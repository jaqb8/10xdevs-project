/**
 * Simple in-memory rate limiter using sliding window algorithm.
 *
 * Limitations for MVP:
 * - State resets on server restart
 * - Does not scale horizontally (multi-instance deployments)
 * - For production, consider using Redis or similar external service
 */

interface RateLimitEntry {
  timestamps: number[];
}

export class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  /**
   * Creates a new rate limiter instance.
   *
   * @param maxRequests - Maximum number of requests allowed per window
   * @param windowMs - Time window in milliseconds
   */
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Checks if a request should be allowed for the given identifier.
   * Uses sliding window algorithm to track request timestamps.
   *
   * @param identifier - Unique identifier (e.g., user ID)
   * @returns true if request is allowed, false if rate limit exceeded
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier) || { timestamps: [] };

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    // Check if limit is exceeded
    if (entry.timestamps.length >= this.maxRequests) {
      this.requests.set(identifier, entry);
      return false;
    }

    // Add current timestamp and allow request
    entry.timestamps.push(now);
    this.requests.set(identifier, entry);
    return true;
  }

  /**
   * Gets the remaining number of requests allowed for the identifier.
   *
   * @param identifier - Unique identifier (e.g., user ID)
   * @returns Number of remaining requests in current window
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry) {
      return this.maxRequests;
    }

    // Count only timestamps within the current window
    const validTimestamps = entry.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  /**
   * Gets the time remaining until the rate limit window resets.
   * Returns the time in milliseconds until the oldest request expires.
   *
   * @param identifier - Unique identifier (e.g., user ID)
   * @returns Time in milliseconds until window reset, or 0 if no active limits
   */
  getTimeUntilReset(identifier: string): number {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || entry.timestamps.length === 0) {
      return 0;
    }

    // Filter timestamps within the current window
    const validTimestamps = entry.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    if (validTimestamps.length === 0) {
      return 0;
    }

    // Find the oldest timestamp in the window
    const oldestTimestamp = Math.min(...validTimestamps);

    // Calculate time remaining until the oldest timestamp expires
    const timeUntilReset = this.windowMs - (now - oldestTimestamp);

    return Math.max(0, timeUntilReset);
  }

  /**
   * Gets the maximum number of requests allowed per window.
   *
   * @returns Maximum number of requests
   */
  getMaxRequests(): number {
    return this.maxRequests;
  }

  /**
   * Gets the time window in milliseconds.
   *
   * @returns Time window in milliseconds
   */
  getWindowMs(): number {
    return this.windowMs;
  }

  /**
   * Clears all rate limit data for the given identifier.
   * Useful for testing or administrative purposes.
   *
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clears all rate limit data.
   * Useful for testing purposes.
   */
  resetAll(): void {
    this.requests.clear();
  }
}

/**
 * Default rate limiter for analysis endpoint.
 * Allows 10 requests per 60 seconds (1 minute) per user by default.
 * Can be configured via environment variables:
 * - RATE_LIMIT_MAX_REQUESTS: Maximum number of requests per window
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds
 */
const maxRequests = import.meta.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(import.meta.env.RATE_LIMIT_MAX_REQUESTS, 10)
  : 10;

const windowMs = import.meta.env.RATE_LIMIT_WINDOW_MS ? parseInt(import.meta.env.RATE_LIMIT_WINDOW_MS, 10) : 60 * 1000;

export const analysisRateLimiter = new RateLimiter(maxRequests, windowMs);
