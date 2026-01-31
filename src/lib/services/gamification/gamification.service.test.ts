import { describe, it, expect, vi, beforeEach } from "vitest";
import { GamificationService } from "./gamification.service";
import { GamificationDatabaseError } from "./gamification.errors";

describe("GamificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordAnalysis", () => {
    it("should call record_analysis RPC with isCorrect parameter", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [{ correct_analyses: 1, total_analyses: 1 }],
          error: null,
        }),
      };
      const service = new GamificationService(mockSupabase as never);

      await service.recordAnalysis(true);

      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("record_analysis", { p_is_correct: true });
    });

    it("should return analysis stats after recording correct analysis", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [{ correct_analyses: 10, total_analyses: 15 }],
          error: null,
        }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.recordAnalysis(true);

      expect(result).toEqual({ correctAnalyses: 10, totalAnalyses: 15 });
    });

    it("should record incorrect analysis without incrementing correct count", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [{ correct_analyses: 5, total_analyses: 10 }],
          error: null,
        }),
      };
      const service = new GamificationService(mockSupabase as never);

      await service.recordAnalysis(false);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("record_analysis", { p_is_correct: false });
    });

    it("should throw GamificationDatabaseError on database error", async () => {
      const dbError = { message: "Connection failed", code: "PGRST116" };
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.recordAnalysis(true)).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith("Database error in recordAnalysis:", dbError);
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns invalid data", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.recordAnalysis(true)).rejects.toThrow(GamificationDatabaseError);
      consoleSpy.mockRestore();
    });
  });

  describe("getAnalysisStats", () => {
    it("should call get_analysis_stats RPC without parameters", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [{ correct_analyses: 0, total_analyses: 0 }],
          error: null,
        }),
      };
      const service = new GamificationService(mockSupabase as never);

      await service.getAnalysisStats();

      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_analysis_stats");
    });

    it("should return analysis stats for authenticated user", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [{ correct_analyses: 42, total_analyses: 50 }],
          error: null,
        }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.getAnalysisStats();

      expect(result).toEqual({ correctAnalyses: 42, totalAnalyses: 50 });
    });

    it("should return zeros for user with no analyses", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [{ correct_analyses: 0, total_analyses: 0 }],
          error: null,
        }),
      };
      const service = new GamificationService(mockSupabase as never);

      const result = await service.getAnalysisStats();

      expect(result).toEqual({ correctAnalyses: 0, totalAnalyses: 0 });
    });

    it("should throw GamificationDatabaseError on database error", async () => {
      const dbError = { message: "Connection failed", code: "PGRST116" };
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.getAnalysisStats()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith("Database error in getAnalysisStats:", dbError);
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns invalid data", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.getAnalysisStats()).rejects.toThrow(GamificationDatabaseError);
      consoleSpy.mockRestore();
    });

    it("should throw GamificationDatabaseError when RPC returns null data and error is null", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      await expect(service.getAnalysisStats()).rejects.toThrow(GamificationDatabaseError);
    });
  });

  describe("resetAnalysisStats", () => {
    it("should call reset_analysis_stats RPC", async () => {
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const service = new GamificationService(mockSupabase as never);

      await service.resetAnalysisStats();

      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("reset_analysis_stats");
    });

    it("should throw GamificationDatabaseError on database error", async () => {
      const dbError = { message: "Connection failed", code: "PGRST116" };
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: dbError }),
      };
      const service = new GamificationService(mockSupabase as never);

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(service.resetAnalysisStats()).rejects.toThrow(GamificationDatabaseError);

      expect(consoleSpy).toHaveBeenCalledWith("Database error in resetAnalysisStats:", dbError);
      consoleSpy.mockRestore();
    });
  });
});
