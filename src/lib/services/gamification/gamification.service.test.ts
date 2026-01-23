import { describe, it, expect, vi, beforeEach } from "vitest";
import { GamificationService } from "./gamification.service";
import { GamificationDatabaseError } from "./gamification.errors";

function createMockSupabase(rpcResponse: { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResponse),
  } as unknown as Parameters<typeof GamificationService.prototype.recordCorrectAnalysis>[0] extends never
    ? ReturnType<typeof createMockSupabase>
    : never;
}

describe("GamificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordCorrectAnalysis", () => {
    it("should call increment_user_points RPC without parameters", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 1, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      await service.recordCorrectAnalysis();

      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("increment_user_points");
    });

    it("should return the new total points after increment", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 42, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.recordCorrectAnalysis();

      expect(result).toBe(42);
    });

    it("should return 1 for first point recorded", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 1, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.recordCorrectAnalysis();

      expect(result).toBe(1);
    });

    it("should throw GamificationDatabaseError on database error", async () => {
      const dbError = { message: "Connection failed", code: "PGRST116" };
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.recordCorrectAnalysis()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith("Database error in recordCorrectAnalysis:", dbError);
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns non-number", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.recordCorrectAnalysis()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Unexpected RPC return type in recordCorrectAnalysis:",
        "object",
        null
      );
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns string instead of number", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: "42", error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.recordCorrectAnalysis()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Unexpected RPC return type in recordCorrectAnalysis:",
        "string",
        "42"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("getUserPointsTotal", () => {
    it("should call get_user_points_total RPC without parameters", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      await service.getUserPointsTotal();

      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_points_total");
    });

    it("should return the total points for authenticated user", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 100, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.getUserPointsTotal();

      expect(result).toBe(100);
    });

    it("should return 0 for user with no points", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.getUserPointsTotal();

      expect(result).toBe(0);
    });

    it("should throw GamificationDatabaseError on database error", async () => {
      const dbError = { message: "Connection failed", code: "PGRST116" };
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.getUserPointsTotal()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith("Database error in getUserPointsTotal:", dbError);
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns non-number", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: undefined, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.getUserPointsTotal()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Unexpected RPC return type in getUserPointsTotal:",
        "undefined",
        undefined
      );
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns array instead of number", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.getUserPointsTotal()).rejects.toThrow(GamificationDatabaseError);
      consoleSpy.mockRestore();
    });
  });
});
