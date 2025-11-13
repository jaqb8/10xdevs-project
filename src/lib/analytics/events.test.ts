import { describe, it, expect, beforeEach, vi } from "vitest";
import { captureServerEvent } from "./posthog.server";
import {
  trackUserSignup,
  trackUserLogin,
  trackUserLogout,
  trackTextAnalysisRequested,
  trackTextAnalysisCompleted,
  trackTextAnalysisFailed,
  trackLearningItemAdded,
  trackLearningItemRemoved,
  trackRateLimitExceeded,
  ANALYTICS_EVENTS,
} from "./events";

vi.mock("./posthog.server", () => ({
  captureServerEvent: vi.fn(),
}));

describe("events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("trackUserSignup", () => {
    it("should track user signup event with user_id and email_domain", () => {
      trackUserSignup({
        user_id: "test-user-id",
        email_domain: "example.com",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.USER_SIGNUP,
        {
          user_id: "test-user-id",
          email_domain: "example.com",
        }
      );
    });

    it("should track user signup event without email_domain", () => {
      trackUserSignup({
        user_id: "test-user-id",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.USER_SIGNUP,
        {
          user_id: "test-user-id",
          email_domain: undefined,
        }
      );
    });
  });

  describe("trackUserLogin", () => {
    it("should track user login event with user_id and email_domain", () => {
      trackUserLogin({
        user_id: "test-user-id",
        email_domain: "example.com",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.USER_LOGIN,
        {
          user_id: "test-user-id",
          email_domain: "example.com",
        }
      );
    });

    it("should track user login event without email_domain", () => {
      trackUserLogin({
        user_id: "test-user-id",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.USER_LOGIN,
        {
          user_id: "test-user-id",
          email_domain: undefined,
        }
      );
    });
  });

  describe("trackUserLogout", () => {
    it("should track user logout event with user_id", () => {
      trackUserLogout({
        user_id: "test-user-id",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.USER_LOGOUT,
        {
          user_id: "test-user-id",
        }
      );
    });
  });

  describe("trackTextAnalysisRequested", () => {
    it("should track text analysis requested event with all properties", () => {
      trackTextAnalysisRequested({
        user_id: "test-user-id",
        mode: "grammar_and_spelling",
        text_length: 100,
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.TEXT_ANALYSIS_REQUESTED,
        {
          user_id: "test-user-id",
          mode: "grammar_and_spelling",
          text_length: 100,
        }
      );
    });

    it("should track text analysis requested event with colloquial_speech mode", () => {
      trackTextAnalysisRequested({
        user_id: "test-user-id",
        mode: "colloquial_speech",
        text_length: 200,
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.TEXT_ANALYSIS_REQUESTED,
        {
          user_id: "test-user-id",
          mode: "colloquial_speech",
          text_length: 200,
        }
      );
    });
  });

  describe("trackTextAnalysisCompleted", () => {
    it("should track text analysis completed event with is_correct true", () => {
      trackTextAnalysisCompleted({
        user_id: "test-user-id",
        mode: "grammar_and_spelling",
        text_length: 100,
        is_correct: true,
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.TEXT_ANALYSIS_COMPLETED,
        {
          user_id: "test-user-id",
          mode: "grammar_and_spelling",
          text_length: 100,
          is_correct: true,
        }
      );
    });

    it("should track text analysis completed event with is_correct false", () => {
      trackTextAnalysisCompleted({
        user_id: "test-user-id",
        mode: "grammar_and_spelling",
        text_length: 100,
        is_correct: false,
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.TEXT_ANALYSIS_COMPLETED,
        {
          user_id: "test-user-id",
          mode: "grammar_and_spelling",
          text_length: 100,
          is_correct: false,
        }
      );
    });
  });

  describe("trackTextAnalysisFailed", () => {
    it("should track text analysis failed event with error message", () => {
      trackTextAnalysisFailed({
        user_id: "test-user-id",
        mode: "grammar_and_spelling",
        text_length: 100,
        error_message: "Analysis failed",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.TEXT_ANALYSIS_FAILED,
        {
          user_id: "test-user-id",
          mode: "grammar_and_spelling",
          text_length: 100,
          error_message: "Analysis failed",
        }
      );
    });
  });

  describe("trackLearningItemAdded", () => {
    it("should track learning item added event with all properties", () => {
      trackLearningItemAdded({
        user_id: "test-user-id",
        item_id: "item-123",
        mode: "grammar_and_spelling",
        analysis_id: "analysis-456",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.LEARNING_ITEM_ADDED,
        {
          user_id: "test-user-id",
          item_id: "item-123",
          mode: "grammar_and_spelling",
          analysis_id: "analysis-456",
        }
      );
    });

    it("should track learning item added event without analysis_id", () => {
      trackLearningItemAdded({
        user_id: "test-user-id",
        item_id: "item-123",
        mode: "colloquial_speech",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.LEARNING_ITEM_ADDED,
        {
          user_id: "test-user-id",
          item_id: "item-123",
          mode: "colloquial_speech",
          analysis_id: undefined,
        }
      );
    });
  });

  describe("trackLearningItemRemoved", () => {
    it("should track learning item removed event with all properties", () => {
      trackLearningItemRemoved({
        user_id: "test-user-id",
        item_id: "item-123",
        mode: "grammar_and_spelling",
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.LEARNING_ITEM_REMOVED,
        {
          user_id: "test-user-id",
          item_id: "item-123",
          mode: "grammar_and_spelling",
        }
      );
    });
  });

  describe("trackRateLimitExceeded", () => {
    it("should track rate limit exceeded event with all properties", () => {
      trackRateLimitExceeded({
        user_id: "test-user-id",
        endpoint: "/api/analyze",
        max_requests: 10,
        window_ms: 60000,
        time_until_reset: 5000,
      });

      expect(captureServerEvent).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.RATE_LIMIT_EXCEEDED,
        {
          user_id: "test-user-id",
          endpoint: "/api/analyze",
          max_requests: 10,
          window_ms: 60000,
          time_until_reset: 5000,
        }
      );
    });
  });
});

