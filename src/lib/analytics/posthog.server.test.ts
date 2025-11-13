import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { __setPosthogConfig, __resetPosthogConfig } from "@/test/mocks/astro-env-server";
import { getPosthog, captureServerEvent, identifyServerUser, shutdownPosthog } from "./posthog.server";

const mockCapture = vi.fn().mockResolvedValue(undefined);
const mockCaptureImmediate = vi.fn().mockResolvedValue(undefined);
const mockIdentify = vi.fn().mockResolvedValue(undefined);
const mockIdentifyImmediate = vi.fn().mockResolvedValue(undefined);
const mockShutdown = vi.fn().mockResolvedValue(undefined);

vi.mock("posthog-node", () => {
  return {
    PostHog: vi.fn().mockImplementation(() => ({
      capture: mockCapture,
      captureImmediate: mockCaptureImmediate,
      identify: mockIdentify,
      identifyImmediate: mockIdentifyImmediate,
      shutdown: mockShutdown,
    })),
  };
});

describe("posthog.server", () => {
  beforeEach(async () => {
    await shutdownPosthog();
    __resetPosthogConfig();
    vi.clearAllMocks();
    mockCapture.mockClear();
    mockCaptureImmediate.mockClear();
    mockIdentify.mockClear();
    mockIdentifyImmediate.mockClear();
    mockShutdown.mockClear();
  });

  afterEach(async () => {
    await shutdownPosthog();
    __resetPosthogConfig();
    vi.clearAllMocks();
    mockCapture.mockClear();
    mockCaptureImmediate.mockClear();
    mockIdentify.mockClear();
    mockIdentifyImmediate.mockClear();
    mockShutdown.mockClear();
  });

  describe("getPosthog", () => {
    it("should return no-op client when API key is missing", () => {
      __setPosthogConfig({ apiKey: undefined });
      const posthog = getPosthog();
      expect(posthog).toBeDefined();
      expect(posthog.capture).toBeDefined();
      expect(posthog.identify).toBeDefined();
      expect(posthog.shutdown).toBeDefined();
    });

    it("should return no-op client when PostHog is disabled", () => {
      __setPosthogConfig({ apiKey: "test-key", disabled: true });
      const posthog = getPosthog();
      expect(posthog).toBeDefined();
    });

    it("should return PostHog instance when API key is provided", () => {
      __setPosthogConfig({ apiKey: "test-key" });
      const posthog = getPosthog();
      expect(posthog).toBeDefined();
    });

    it("should use default host when host is not provided", async () => {
      __setPosthogConfig({ apiKey: "test-key" });
      const { PostHog } = await import("posthog-node");
      const { getPosthog } = await import("./posthog.server");
      getPosthog();
      expect(PostHog).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          host: "https://us.posthog.com",
        })
      );
    });

    it("should use custom host when provided", async () => {
      await shutdownPosthog();
      __setPosthogConfig({ apiKey: "test-key", host: "https://custom.posthog.com" });
      const { PostHog } = await import("posthog-node");
      const { getPosthog } = await import("./posthog.server");
      getPosthog();
      expect(PostHog).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          host: "https://custom.posthog.com",
        })
      );
    });

    it("should return same instance on subsequent calls", () => {
      __setPosthogConfig({ apiKey: "test-key" });
      const posthog1 = getPosthog();
      const posthog2 = getPosthog();
      expect(posthog1).toBe(posthog2);
    });
  });

  describe("captureServerEvent", () => {
    it("should not capture event when PostHog is disabled", async () => {
      await shutdownPosthog();
      __setPosthogConfig({ apiKey: "test-key", disabled: true });
      const { captureServerEvent } = await import("./posthog.server");

      captureServerEvent("test_event", { user_id: "test-user" });

      expect(mockCaptureImmediate).not.toHaveBeenCalled();
    });

    it("should capture event with user_id when provided", async () => {
      __setPosthogConfig({ apiKey: "test-key" });

      captureServerEvent("test_event", { user_id: "test-user", custom_prop: "value" });

      expect(mockCaptureImmediate).toHaveBeenCalledWith({
        distinctId: "test-user",
        event: "test_event",
        properties: { user_id: "test-user", custom_prop: "value" },
      });
    });

    it("should use 'anonymous' as distinctId when user_id is not provided", async () => {
      __setPosthogConfig({ apiKey: "test-key" });

      captureServerEvent("test_event", { custom_prop: "value" });

      expect(mockCaptureImmediate).toHaveBeenCalledWith({
        distinctId: "anonymous",
        event: "test_event",
        properties: { custom_prop: "value" },
      });
    });

    it("should handle errors gracefully", async () => {
      __setPosthogConfig({ apiKey: "test-key" });
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockCaptureImmediate.mockRejectedValueOnce(new Error("PostHog error"));

      captureServerEvent("test_event", { user_id: "test-user" });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to capture PostHog event:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe("identifyServerUser", () => {
    it("should not identify user when PostHog is disabled", async () => {
      await shutdownPosthog();
      __setPosthogConfig({ apiKey: "test-key", disabled: true });
      const { identifyServerUser } = await import("./posthog.server");

      identifyServerUser("test-user", { email_domain: "example.com" });

      expect(mockIdentifyImmediate).not.toHaveBeenCalled();
    });

    it("should identify user with traits", async () => {
      __setPosthogConfig({ apiKey: "test-key" });

      identifyServerUser("test-user", { email_domain: "example.com", name: "Test User" });

      expect(mockIdentifyImmediate).toHaveBeenCalledWith({
        distinctId: "test-user",
        properties: { email_domain: "example.com", name: "Test User" },
      });
    });

    it("should identify user without traits", async () => {
      __setPosthogConfig({ apiKey: "test-key" });

      identifyServerUser("test-user");

      expect(mockIdentifyImmediate).toHaveBeenCalledWith({
        distinctId: "test-user",
        properties: undefined,
      });
    });

    it("should handle errors gracefully", async () => {
      __setPosthogConfig({ apiKey: "test-key" });
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockIdentifyImmediate.mockRejectedValueOnce(new Error("PostHog error"));

      identifyServerUser("test-user");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to identify PostHog user:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe("shutdownPosthog", () => {
    it("should shutdown PostHog instance when it exists", async () => {
      __setPosthogConfig({ apiKey: "test-key" });

      getPosthog();
      shutdownPosthog();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockShutdown).toHaveBeenCalled();
    });

    it("should not throw error when instance does not exist", () => {
      __setPosthogConfig({ apiKey: undefined });

      expect(() => shutdownPosthog()).not.toThrow();
    });
  });
});
