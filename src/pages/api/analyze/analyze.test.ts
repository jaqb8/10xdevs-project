import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./index";
import type { TextAnalysisDto } from "@/types";
import {
  OpenRouterConfigurationError,
  OpenRouterAuthenticationError,
  OpenRouterRateLimitError,
  OpenRouterInvalidRequestError,
  OpenRouterResponseValidationError,
  OpenRouterNetworkError,
} from "@/lib/services/openrouter";

vi.mock("@/lib/services/openrouter", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/services/openrouter")>();
  return {
    ...original,
    openRouterService: {
      getChatCompletion: vi.fn(),
    },
  };
});

const mockRecordCorrectAnalysis = vi.fn();

vi.mock("@/lib/services/gamification", () => ({
  GamificationService: vi.fn().mockImplementation(() => ({
    recordCorrectAnalysis: mockRecordCorrectAnalysis,
  })),
}));

import { openRouterService } from "@/lib/services/openrouter";
import { GamificationService } from "@/lib/services/gamification";

interface MockAPIContext {
  request: Request;
  locals: {
    user: { id: string; email: string } | null;
    analysisQuota: { remaining: number; resetAt: string; limit: number } | null;
    supabase: object;
  };
}

function createMockRequest(body: object): Request {
  return new Request("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createRawRequest(body: string): Request {
  return new Request("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

const mockSupabase = {};

function createMockContext(request: Request, overrides?: Partial<MockAPIContext["locals"]>): MockAPIContext {
  return {
    request,
    locals: {
      user: null,
      analysisQuota: null,
      supabase: mockSupabase,
      ...overrides,
    },
  };
}

describe("POST /api/analyze", () => {
  const mockCorrectResult: TextAnalysisDto = {
    is_correct: true,
    original_text: "Hello world.",
    translation: "Witaj świecie.",
  };

  const mockErrorResult: TextAnalysisDto = {
    is_correct: false,
    original_text: "I gonna go home.",
    corrected_text: "I'm going to go home.",
    explanation: "Use 'going to' instead of 'gonna' in formal contexts.",
    translation: "Zamierzam iść do domu.",
  };

  const mockUser = { id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecordCorrectAnalysis.mockResolvedValue(1);
  });

  describe("context handling in userMessage", () => {
    it("should pass analysisContext to AI service when provided", async () => {
      const request = createMockRequest({
        text: "I gonna go home.",
        mode: "grammar_and_spelling",
        analysisContext: "Writing a formal business email",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(openRouterService.getChatCompletion).toHaveBeenCalledTimes(1);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toContain("Tekst do analizy:");
      expect(callArgs.userMessage).toContain("Kontekst użytkownika:");
      expect(callArgs.userMessage).toContain("I gonna go home.");
      expect(callArgs.userMessage).toContain("Writing a formal business email");
    });

    it("should not include context section when analysisContext is empty string", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
        analysisContext: "",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toBe("Hello world.");
      expect(callArgs.userMessage).not.toContain("Tekst do analizy:");
      expect(callArgs.userMessage).not.toContain("Kontekst użytkownika:");
    });

    it("should not include context section when analysisContext is only whitespace", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
        analysisContext: "   ",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toBe("Hello world.");
      expect(callArgs.userMessage).not.toContain("Kontekst użytkownika:");
    });

    it("should work without analysisContext field at all", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toBe("Hello world.");
    });

    it("should trim analysisContext whitespace", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
        analysisContext: "   Formal email context   ",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toContain("Kontekst użytkownika:\nFormal email context");
      expect(callArgs.userMessage).not.toContain("   Formal email context   ");
    });

    it("should format userMessage correctly with context", async () => {
      const text = "Test text.";
      const context = "Business context";
      const request = createMockRequest({
        text,
        mode: "grammar_and_spelling",
        analysisContext: context,
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toBe(`Tekst do analizy:\n${text}\n\nKontekst użytkownika:\n${context}`);
    });

    it("should work with context in colloquial_speech mode", async () => {
      const request = createMockRequest({
        text: "I request your assistance.",
        mode: "colloquial_speech",
        analysisContext: "Casual chat with friends",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toContain("Casual chat with friends");
    });
  });

  describe("context validation", () => {
    it("should return validation error when analysisContext exceeds 500 characters", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
        analysisContext: "A".repeat(501),
      });

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error_code).toBe("validation_error_analysis_context_too_long");
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });

    it("should accept analysisContext at exactly 500 characters", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
        analysisContext: "A".repeat(500),
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(openRouterService.getChatCompletion).toHaveBeenCalledTimes(1);
    });
  });

  describe("context with special characters", () => {
    it("should handle context with unicode characters", async () => {
      const request = createMockRequest({
        text: "Hello.",
        mode: "grammar_and_spelling",
        analysisContext: "Kontekst z polskimi znakami: ąęćółńśźż 🎉",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toContain("ąęćółńśźż");
      expect(callArgs.userMessage).toContain("🎉");
    });

    it("should handle context with newlines", async () => {
      const multilineContext = `First line
Second line
Third line`;
      const request = createMockRequest({
        text: "Hello.",
        mode: "grammar_and_spelling",
        analysisContext: multilineContext,
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toContain("First line");
      expect(callArgs.userMessage).toContain("Second line");
    });

    it("should handle context with quotes and special JSON characters", async () => {
      const request = createMockRequest({
        text: "Hello.",
        mode: "grammar_and_spelling",
        analysisContext: 'Context with "quotes" and \\backslash',
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toContain('"quotes"');
    });
  });

  describe("response format", () => {
    it("should return proper response with analysis result", async () => {
      const request = createMockRequest({
        text: "I gonna go home.",
        mode: "grammar_and_spelling",
        analysisContext: "Formal email",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const body = await response.json();
      expect(body).toEqual(mockErrorResult);
    });

    it("should include quota headers when quota is set", async () => {
      const request = createMockRequest({
        text: "Hello.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const context = createMockContext(request, {
        analysisQuota: {
          remaining: 5,
          resetAt: "2024-12-18T00:00:00Z",
          limit: 10,
        },
      });

      const response = await POST(context as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Daily-Quota-Remaining")).toBe("5");
      expect(response.headers.get("X-Daily-Quota-Reset-At")).toBe("2024-12-18T00:00:00Z");
      expect(response.headers.get("X-Daily-Quota-Limit")).toBe("10");
    });

    it("should not include quota headers when quota is not set", async () => {
      const request = createMockRequest({
        text: "Hello.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Daily-Quota-Remaining")).toBeNull();
      expect(response.headers.get("X-Daily-Quota-Reset-At")).toBeNull();
      expect(response.headers.get("X-Daily-Quota-Limit")).toBeNull();
    });
  });

  describe("text field validation", () => {
    it("should return validation error when text is missing", async () => {
      const request = createMockRequest({
        mode: "grammar_and_spelling",
      });

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error_code).toBe("Required");
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });

    it("should return validation error when text is empty string", async () => {
      const request = createMockRequest({
        text: "",
        mode: "grammar_and_spelling",
      });

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error_code).toBe("validation_error_text_empty");
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });

    it("should return validation error when text is only whitespace", async () => {
      const request = createMockRequest({
        text: "   ",
        mode: "grammar_and_spelling",
      });

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error_code).toBe("validation_error_text_empty");
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });

    it("should return validation error when text exceeds 500 characters", async () => {
      const request = createMockRequest({
        text: "A".repeat(501),
        mode: "grammar_and_spelling",
      });

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error_code).toBe("validation_error_text_too_long");
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });

    it("should accept text at exactly 500 characters", async () => {
      const request = createMockRequest({
        text: "A".repeat(500),
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(openRouterService.getChatCompletion).toHaveBeenCalledTimes(1);
    });

    it("should trim text whitespace before validation", async () => {
      const request = createMockRequest({
        text: "  Hello world.  ",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.userMessage).toBe("Hello world.");
    });
  });

  describe("mode field validation", () => {
    it("should use grammar_and_spelling as default mode when not provided", async () => {
      const request = createMockRequest({
        text: "Hello world.",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.systemMessage).toContain("gramatyki");
    });

    it("should accept grammar_and_spelling mode", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
    });

    it("should accept colloquial_speech mode", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "colloquial_speech",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
    });

    it("should return validation error for invalid mode", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "invalid_mode",
      });

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error_code).toBe("validation_error_invalid_mode");
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });
  });

  describe("request parsing", () => {
    it("should handle invalid JSON in request body", async () => {
      const request = createRawRequest("{ invalid json }");

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      expect(openRouterService.getChatCompletion).not.toHaveBeenCalled();
    });
  });

  describe("analysis result types", () => {
    it("should return correct result when text has no errors", async () => {
      const request = createMockRequest({
        text: "This is a correct sentence.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.is_correct).toBe(true);
      expect(body.original_text).toBeDefined();
      expect(body.corrected_text).toBeUndefined();
      expect(body.explanation).toBeUndefined();
    });

    it("should return error result when text has errors", async () => {
      const request = createMockRequest({
        text: "I gonna go home.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.is_correct).toBe(false);
      expect(body.original_text).toBeDefined();
      expect(body.corrected_text).toBeDefined();
      expect(body.explanation).toBeDefined();
    });

    it("should include translation in response when available", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.translation).toBe("Witaj świecie.");
    });

    it("should handle null translation in response", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      const resultWithNullTranslation: TextAnalysisDto = {
        is_correct: true,
        original_text: "Hello world.",
        translation: null,
      };

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(resultWithNullTranslation);

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.translation).toBeNull();
    });
  });

  describe("error handling from AnalysisService", () => {
    it("should return 500 for configuration error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterConfigurationError());

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("configuration_error");
    });

    it("should return 500 for authentication error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterAuthenticationError());

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("authentication_error");
    });

    it("should return 429 for rate limit error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterRateLimitError());

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.error_code).toBe("rate_limit_error");
    });

    it("should return 500 for invalid request error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterInvalidRequestError());

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("invalid_request_error");
    });

    it("should return 500 for response validation error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterResponseValidationError());

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("validation_error");
    });

    it("should return 500 for network error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterNetworkError());

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("network_error");
    });

    it("should return 500 for unknown error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new Error("Unknown error"));

      const response = await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error_code).toBe("unknown_error");
    });
  });

  describe("analysis modes integration", () => {
    it("should use grammar prompt for grammar_and_spelling mode", async () => {
      const request = createMockRequest({
        text: "I is happy.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.systemMessage).toBeDefined();
      expect(callArgs.systemMessage.length).toBeGreaterThan(0);
    });

    it("should use colloquial prompt for colloquial_speech mode", async () => {
      const request = createMockRequest({
        text: "I request your assistance.",
        mode: "colloquial_speech",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      await POST(createMockContext(request) as Parameters<typeof POST>[0]);

      const callArgs = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0];
      expect(callArgs.systemMessage).toBeDefined();
      expect(callArgs.systemMessage.length).toBeGreaterThan(0);
    });

    it("should use different prompts for different modes", async () => {
      const grammarRequest = createMockRequest({
        text: "Hello.",
        mode: "grammar_and_spelling",
      });

      const colloquialRequest = createMockRequest({
        text: "Hello.",
        mode: "colloquial_speech",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      await POST(createMockContext(grammarRequest) as Parameters<typeof POST>[0]);
      const grammarPrompt = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0].systemMessage;

      vi.clearAllMocks();

      await POST(createMockContext(colloquialRequest) as Parameters<typeof POST>[0]);
      const colloquialPrompt = vi.mocked(openRouterService.getChatCompletion).mock.calls[0][0].systemMessage;

      expect(grammarPrompt).not.toBe(colloquialPrompt);
    });
  });

  describe("gamification points integration", () => {
    it("should record gamification point when analysis is correct and user is logged in", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(GamificationService).toHaveBeenCalledWith(mockSupabase);
      expect(mockRecordCorrectAnalysis).toHaveBeenCalledWith(mockUser.id);
      expect(mockRecordCorrectAnalysis).toHaveBeenCalledTimes(1);
    });

    it("should NOT record gamification point when analysis has errors", async () => {
      const request = createMockRequest({
        text: "I gonna go home.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockErrorResult);

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(mockRecordCorrectAnalysis).not.toHaveBeenCalled();
    });

    it("should NOT record gamification point when user is not logged in", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request, { user: null }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(mockRecordCorrectAnalysis).not.toHaveBeenCalled();
    });

    it("should return successful response even if gamification service throws an error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);
      mockRecordCorrectAnalysis.mockRejectedValue(new Error("Database connection failed"));

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.is_correct).toBe(true);
      expect(mockRecordCorrectAnalysis).toHaveBeenCalledWith(mockUser.id);
    });

    it("should record point for correct analysis with context", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
        analysisContext: "Formal email",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(mockRecordCorrectAnalysis).toHaveBeenCalledWith(mockUser.id);
    });

    it("should record point for correct analysis in colloquial_speech mode", async () => {
      const request = createMockRequest({
        text: "Hey, what's up?",
        mode: "colloquial_speech",
      });

      vi.mocked(openRouterService.getChatCompletion).mockResolvedValue(mockCorrectResult);

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(200);
      expect(mockRecordCorrectAnalysis).toHaveBeenCalledWith(mockUser.id);
    });

    it("should NOT record point when validation fails", async () => {
      const request = createMockRequest({
        text: "",
        mode: "grammar_and_spelling",
      });

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(400);
      expect(mockRecordCorrectAnalysis).not.toHaveBeenCalled();
    });

    it("should NOT record point when analysis service throws an error", async () => {
      const request = createMockRequest({
        text: "Hello world.",
        mode: "grammar_and_spelling",
      });

      vi.mocked(openRouterService.getChatCompletion).mockRejectedValue(new OpenRouterNetworkError());

      const response = await POST(createMockContext(request, { user: mockUser }) as Parameters<typeof POST>[0]);

      expect(response.status).toBe(500);
      expect(mockRecordCorrectAnalysis).not.toHaveBeenCalled();
    });
  });
});
