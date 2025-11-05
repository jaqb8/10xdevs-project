import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearningItemsService } from "./learning-items.service";
import { LearningItemsDatabaseError } from "./learning-items.errors";
import type { DrizzleDb } from "../../../db/drizzle.client";

describe("LearningItemsService - getLearningItems pagination logic", () => {
  let service: LearningItemsService;
  let mockDb: DrizzleDb;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockWhere: ReturnType<typeof vi.fn>;
  let mockOrderBy: ReturnType<typeof vi.fn>;
  let mockLimit: ReturnType<typeof vi.fn>;
  let mockOffset: ReturnType<typeof vi.fn>;
  let mockCount: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockValues: ReturnType<typeof vi.fn>;
  let mockReturning: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCount = vi.fn();
    mockSelect = vi.fn();
    mockFrom = vi.fn();
    mockWhere = vi.fn();
    mockOrderBy = vi.fn();
    mockLimit = vi.fn();
    mockOffset = vi.fn();
    mockInsert = vi.fn();
    mockValues = vi.fn();
    mockReturning = vi.fn();
    mockDelete = vi.fn();

    mockDb = {
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    } as unknown as DrizzleDb;

    service = new LearningItemsService(mockDb);
  });

  const createMockCountQuery = (countResult: number) => {
    mockSelect.mockReturnValueOnce({
      from: mockFrom,
    });
    mockFrom.mockReturnValueOnce({
      where: mockWhere,
    });
    mockWhere.mockReturnValueOnce([
      { count: countResult },
    ]);
  };

  const createMockDataQuery = (data: any[]) => {
    mockSelect.mockReturnValueOnce({
      from: mockFrom,
    });
    mockFrom.mockReturnValueOnce({
      where: mockWhere,
    });
    mockWhere.mockReturnValueOnce({
      orderBy: mockOrderBy,
    });
    mockOrderBy.mockReturnValueOnce({
      limit: mockLimit,
    });
    mockLimit.mockReturnValueOnce({
      offset: mockOffset,
    });
    mockOffset.mockResolvedValueOnce(data);
  };

  describe("normal pagination with data", () => {
    it("should return paginated data for page 1 with 10 items", async () => {
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
          analysis_mode: "grammar_and_spelling",
          created_at: new Date("2023-01-01"),
        },
        {
          id: "2",
          original_sentence: "test2",
          corrected_sentence: "test2",
          explanation: "test2",
          analysis_mode: "grammar_and_spelling",
          created_at: new Date("2023-01-02"),
        },
        {
          id: "3",
          original_sentence: "test3",
          corrected_sentence: "test3",
          explanation: "test3",
          analysis_mode: "grammar_and_spelling",
          created_at: new Date("2023-01-03"),
        },
        {
          id: "4",
          original_sentence: "test4",
          corrected_sentence: "test4",
          explanation: "test4",
          analysis_mode: "grammar_and_spelling",
          created_at: new Date("2023-01-04"),
        },
        {
          id: "5",
          original_sentence: "test5",
          corrected_sentence: "test5",
          explanation: "test5",
          analysis_mode: "grammar_and_spelling",
          created_at: new Date("2023-01-05"),
        },
      ];

      createMockCountQuery(totalItems);
      createMockDataQuery(mockData);

      const result = await service.getLearningItems(userId, page, pageSize);

      expect(result).toEqual({
        data: [
          {
            id: "1",
            original_sentence: "test1",
            corrected_sentence: "test1",
            explanation: "test1",
            analysis_mode: "grammar_and_spelling",
            created_at: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "2",
            original_sentence: "test2",
            corrected_sentence: "test2",
            explanation: "test2",
            analysis_mode: "grammar_and_spelling",
            created_at: "2023-01-02T00:00:00.000Z",
          },
          {
            id: "3",
            original_sentence: "test3",
            corrected_sentence: "test3",
            explanation: "test3",
            analysis_mode: "grammar_and_spelling",
            created_at: "2023-01-03T00:00:00.000Z",
          },
          {
            id: "4",
            original_sentence: "test4",
            corrected_sentence: "test4",
            explanation: "test4",
            analysis_mode: "grammar_and_spelling",
            created_at: "2023-01-04T00:00:00.000Z",
          },
          {
            id: "5",
            original_sentence: "test5",
            corrected_sentence: "test5",
            explanation: "test5",
            analysis_mode: "grammar_and_spelling",
            created_at: "2023-01-05T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 5,
          totalItems: 12,
          totalPages: 3,
        },
      });
    });

    it("should calculate correct offset for page 2", async () => {
      const userId = "user-123";
      const page = 2;
      const pageSize = 3;
      const totalItems = 10;

      createMockCountQuery(totalItems);
      createMockDataQuery([]);

      await service.getLearningItems(userId, page, pageSize);

      expect(mockOffset).toHaveBeenCalledWith(3);
    });
  });

  describe("edge cases", () => {
    it("should return empty data when no items exist", async () => {
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;

      createMockCountQuery(0);

      const result = await service.getLearningItems(userId, page, pageSize);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          pageSize: 5,
          totalItems: 0,
          totalPages: 0,
        },
      });

      expect(mockSelect).toHaveBeenCalledTimes(1);
    });

    it("should return empty data when requesting page beyond available data", async () => {
      const userId = "user-123";
      const page = 5;
      const pageSize = 5;
      const totalItems = 12;

      createMockCountQuery(totalItems);

      const result = await service.getLearningItems(userId, page, pageSize);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 5,
          pageSize: 5,
          totalItems: 12,
          totalPages: 3,
        },
      });

      expect(mockSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should throw LearningItemsDatabaseError when count query fails", async () => {
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;
      const mockError = new Error("Database connection failed");

      mockSelect.mockReturnValueOnce({
        from: mockFrom,
      });
      mockFrom.mockReturnValueOnce({
        where: mockWhere,
      });
      mockWhere.mockRejectedValueOnce(mockError);

      await expect(service.getLearningItems(userId, page, pageSize)).rejects.toThrow(LearningItemsDatabaseError);
    });

    it("should throw LearningItemsDatabaseError when data query fails", async () => {
      const userId = "user-123";
      const page = 1;
      const pageSize = 5;
      const mockError = new Error("Query failed");

      createMockCountQuery(5);

      mockSelect.mockReturnValueOnce({
        from: mockFrom,
      });
      mockFrom.mockReturnValueOnce({
        where: mockWhere,
      });
      mockWhere.mockReturnValueOnce({
        orderBy: mockOrderBy,
      });
      mockOrderBy.mockReturnValueOnce({
        limit: mockLimit,
      });
      mockLimit.mockReturnValueOnce({
        offset: mockOffset,
      });
      mockOffset.mockRejectedValueOnce(mockError);

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
        const userId = "user-123";
        const page = 1;

        createMockCountQuery(totalItems);

        const result = await service.getLearningItems(userId, page, pageSize);

        expect(result.pagination.totalPages).toBe(expectedTotalPages);
      }
    );
  });
});