import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./points";
import { GamificationDatabaseError } from "@/lib/services/gamification";

const mockGetAnalysisStats = vi.fn();

vi.mock("@/lib/services/gamification", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/services/gamification")>();
  return {
    ...original,
    GamificationService: vi.fn().mockImplementation(() => ({
      getAnalysisStats: mockGetAnalysisStats,
    })),
  };
});

interface MockAPIContext {
  locals: {
    user: { id: string; email: string } | null;
    supabase: object;
  };
}

function createMockContext(overrides?: Partial<MockAPIContext["locals"]>): MockAPIContext {
  return {
    locals: {
      user: null,
      supabase: {},
      ...overrides,
    },
  };
}

describe("GET /api/gamification/points", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      const context = createMockContext({ user: null });

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error_code).toBe("unauthorized");
    });

    it("should return 200 when user is authenticated", async () => {
      const context = createMockContext({
        user: { id: "user-123", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockResolvedValue({ correctAnalyses: 10, totalAnalyses: 15 });

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
    });
  });

  describe("successful responses", () => {
    it("should return analysis stats for authenticated user", async () => {
      const context = createMockContext({
        user: { id: "user-123", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockResolvedValue({ correctAnalyses: 42, totalAnalyses: 50 });

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.correctAnalyses).toBe(42);
      expect(body.totalAnalyses).toBe(50);
    });

    it("should return zero stats for user with no analyses", async () => {
      const context = createMockContext({
        user: { id: "user-456", email: "new@example.com" },
      });
      mockGetAnalysisStats.mockResolvedValue({ correctAnalyses: 0, totalAnalyses: 0 });

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.correctAnalyses).toBe(0);
      expect(body.totalAnalyses).toBe(0);
    });

    it("should call GamificationService without parameters (auth.uid used internally)", async () => {
      const context = createMockContext({
        user: { id: "user-789", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockResolvedValue({ correctAnalyses: 5, totalAnalyses: 10 });

      await GET(context as Parameters<typeof GET>[0]);

      expect(mockGetAnalysisStats).toHaveBeenCalledWith();
    });
  });

  describe("error handling", () => {
    it("should return 500 on database error", async () => {
      const context = createMockContext({
        user: { id: "user-123", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockRejectedValue(new GamificationDatabaseError(new Error("DB error")));

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("database_error");
    });

    it("should return 500 on unexpected error", async () => {
      const context = createMockContext({
        user: { id: "user-123", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockRejectedValue(new Error("Unexpected error"));

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("unknown_error");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("response format", () => {
    it("should return JSON content type", async () => {
      const context = createMockContext({
        user: { id: "user-123", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockResolvedValue({ correctAnalyses: 5, totalAnalyses: 5 });

      const response = await GET(context as Parameters<typeof GET>[0]);

      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should return response with correctAnalyses and totalAnalyses properties", async () => {
      const context = createMockContext({
        user: { id: "user-123", email: "test@example.com" },
      });
      mockGetAnalysisStats.mockResolvedValue({ correctAnalyses: 100, totalAnalyses: 120 });

      const response = await GET(context as Parameters<typeof GET>[0]);
      const body = await response.json();

      expect(body).toHaveProperty("correctAnalyses");
      expect(body).toHaveProperty("totalAnalyses");
      expect(typeof body.correctAnalyses).toBe("number");
      expect(typeof body.totalAnalyses).toBe("number");
    });
  });
});
