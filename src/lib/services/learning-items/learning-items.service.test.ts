import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearningItemsService } from "./learning-items.service";
import { LearningItemsDatabaseError } from "./learning-items.errors";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

describe("LearningItemsService - getLearningItems pagination logic", () => {
  let service: LearningItemsService;
  let callCounter: { count: number };

  beforeEach(() => {
    vi.clearAllMocks();
    callCounter = { count: 0 };
    service = new LearningItemsService(mockSupabase as any);
  });

  // Helper function to create a proper Supabase query builder mock
  const createMockQueryBuilder = (config: {
    countResult?: { count: number | null; error: any };
    dataResult?: { data: any[] | null; error: any };
  }) => {
    const { countResult = { count: 0, error: null }, dataResult = { data: [], error: null } } = config;

    // Reset call counter for this test
    callCounter.count = 0;

    mockSupabase.from.mockImplementation((tableName) => {
      if (tableName !== "learning_items") return {};

      callCounter.count++;

      if (callCounter.count === 1) {
        // Count query: from().select("*", { count: "exact", head: true }).eq()
        return {
          select: vi.fn().mockImplementation((fields, options) => {
            // Two arguments: fields and options
            if (fields === "*" && options?.count === "exact") {
              const eqMock = vi.fn().mockImplementation(() => {
                // For count queries with head: true, Supabase returns the count directly
                return Promise.resolve(countResult);
              });
              return { eq: eqMock };
            }
            return {};
          }),
        };
      } else {
        // Data query: from().select("id, original_sentence, corrected_sentence, explanation, created_at").eq().order().range()
        return {
          select: vi.fn().mockImplementation((fields) => {
            // Data query: first arg is a string with comma-separated field names
            if (typeof fields === "string" && fields.includes("id") && fields.includes("original_sentence")) {
              return {
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    range: vi.fn().mockResolvedValue(dataResult),
                  }),
                }),
              };
            }
            return {};
          }),
        };
      }
    });
  };

  describe("normal pagination with data", () => {
    it("should return paginated data for page 1 with 10 items", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;
      const totalItems = 12;

      const mockData = [
        {
          id: "1",
          original_sentence: "test1",
          corrected_sentence: "test1",
          explanation: "test1",
          created_at: "2023-01-01",
        },
        {
          id: "2",
          original_sentence: "test2",
          corrected_sentence: "test2",
          explanation: "test2",
          created_at: "2023-01-02",
        },
        {
          id: "3",
          original_sentence: "test3",
          corrected_sentence: "test3",
          explanation: "test3",
          created_at: "2023-01-03",
        },
        {
          id: "4",
          original_sentence: "test4",
          corrected_sentence: "test4",
          explanation: "test4",
          created_at: "2023-01-04",
        },
        {
          id: "5",
          original_sentence: "test5",
          corrected_sentence: "test5",
          explanation: "test5",
          created_at: "2023-01-05",
        },
      ];

      createMockQueryBuilder({
        countResult: { count: totalItems, error: null },
        dataResult: { data: mockData, error: null },
      });

      // Act
      const result = await service.getLearningItems(userId, page, pageSize);

      // Assert
      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          pageSize: 5,
          totalItems: 12,
          totalPages: 3, // Math.ceil(12/5) = 3
        },
      });
    });

    it("should calculate correct offset for page 2", async () => {
      // Arrange
      const userId = "user-123";
      const page = 2;
      const pageSize = 3;
      const totalItems = 10;

      let capturedRangeMock: any;
      callCounter.count = 0; // Reset counter

      mockSupabase.from.mockImplementation((tableName) => {
        if (tableName !== "learning_items") return {};

        callCounter.count++;

        if (callCounter.count === 1) {
          // Count query
          return {
            select: vi.fn().mockImplementation((fields, options) => {
              if (fields === "*" && options?.count === "exact") {
                const eqMock = vi.fn().mockImplementation(() => {
                  // For count queries with head: true, Supabase returns the count directly
                  return Promise.resolve({ count: totalItems, error: null });
                });
                return { eq: eqMock };
              }
              return {};
            }),
          };
        } else {
          // Data query - capture range mock
          capturedRangeMock = vi.fn().mockResolvedValue({ data: [], error: null });
          return {
            select: vi.fn().mockImplementation((fields) => {
              if (typeof fields === "string" && fields.includes("id") && fields.includes("original_sentence")) {
                return {
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      range: capturedRangeMock,
                    }),
                  }),
                };
              }
              return {};
            }),
          };
        }
      });

      // Act
      await service.getLearningItems(userId, page, pageSize);

      // Assert
      expect(capturedRangeMock).toHaveBeenCalledWith(3, 5); // offset = (2-1)*3 = 3, range = 3 to 3+3-1 = 5
    });
  });

  describe("edge cases", () => {
    it("should return empty data when no items exist", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;

      createMockQueryBuilder({
        countResult: { count: 0, error: null },
        dataResult: { data: [], error: null },
      });

      // Act
      const result = await service.getLearningItems(userId, page, pageSize);

      // Assert
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          pageSize: 5,
          totalItems: 0,
          totalPages: 0,
        },
      });
    });

    it("should return empty data when requesting page beyond available data", async () => {
      // Arrange
      const userId = "user-123";
      const page = 5;
      const pageSize = 5;
      const totalItems = 12; // Only 3 pages available (Math.ceil(12/5) = 3)

      createMockQueryBuilder({
        countResult: { count: totalItems, error: null },
        dataResult: { data: [], error: null }, // This shouldn't be called due to early return
      });

      // Act
      const result = await service.getLearningItems(userId, page, pageSize);

      // Assert - should return empty data for invalid page
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 5,
          pageSize: 5,
          totalItems: 12,
          totalPages: 3,
        },
      });

      // Verify that data query was not called (since we return early when offset >= totalItems)
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Only count query
    });
  });

  describe("error handling", () => {
    it("should throw LearningItemsDatabaseError when count query fails", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;
      const mockError = { message: "Database connection failed" };

      createMockQueryBuilder({
        countResult: { count: null, error: mockError },
        dataResult: { data: [], error: null },
      });

      // Act & Assert
      await expect(service.getLearningItems(userId, page, pageSize)).rejects.toThrow(LearningItemsDatabaseError);
    });

    it("should throw LearningItemsDatabaseError when data query fails", async () => {
      // Arrange
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;
      const mockError = { message: "Query failed" };

      createMockQueryBuilder({
        countResult: { count: 5, error: null },
        dataResult: { data: null, error: mockError },
      });

      // Act & Assert
      await expect(service.getLearningItems(userId, page, pageSize)).rejects.toThrow(LearningItemsDatabaseError);
    });
  });

  describe("pagination calculations", () => {
    it.each([
      { totalItems: 0, pageSize: 5, expectedTotalPages: 0 },
      { totalItems: 1, pageSize: 5, expectedTotalPages: 1 },
      { totalItems: 5, pageSize: 5, expectedTotalPages: 1 },
      { totalItems: 6, pageSize: 5, expectedTotalPages: 2 },
      { totalItems: 10, pageSize: 3, expectedTotalPages: 4 },
      { totalItems: 11, pageSize: 3, expectedTotalPages: 4 },
    ])(
      "should calculate totalPages correctly: $totalItems items, pageSize $pageSize = $expectedTotalPages pages",
      async ({ totalItems, pageSize, expectedTotalPages }) => {
        // Arrange
        const userId = "user-123";
        const page = 1;

        createMockQueryBuilder({
          countResult: { count: totalItems, error: null },
          dataResult: { data: [], error: null },
        });

        // Act
        const result = await service.getLearningItems(userId, page, pageSize);

        // Assert
        expect(result.pagination.totalPages).toBe(expectedTotalPages);
      }
    );
  });
});
