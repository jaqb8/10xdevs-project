import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { __setPosthogClientConfig, __resetPosthogClientConfig } from "@/test/mocks/astro-env-client";
import type { UserViewModel } from "@/types";

const mockCapture = vi.fn();
const mockIdentify = vi.fn();
const mockInit = vi.fn();

vi.mock("posthog-js", () => {
  return {
    default: {
      init: mockInit,
      capture: mockCapture,
      identify: mockIdentify,
    },
  };
});

describe("posthog.client", () => {
  beforeEach(() => {
    __resetPosthogClientConfig();
    vi.clearAllMocks();
    mockCapture.mockClear();
    mockIdentify.mockClear();
    mockInit.mockClear();
    
    Object.defineProperty(global, "window", {
      value: {
        ...global.window,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    __resetPosthogClientConfig();
    vi.clearAllMocks();
    mockCapture.mockClear();
    mockIdentify.mockClear();
    mockInit.mockClear();
  });

  describe("initPosthogClient", () => {
    it("should not initialize when API key is missing", async () => {
      __setPosthogClientConfig({ apiKey: undefined });
      const { initPosthogClient } = await import("./posthog.client");
      
      await initPosthogClient(null);
      
      expect(mockInit).not.toHaveBeenCalled();
    });

    it("should not initialize when PostHog is disabled", async () => {
      __setPosthogClientConfig({ apiKey: "test-key", disabled: true });
      const { initPosthogClient } = await import("./posthog.client");
      
      await initPosthogClient(null);
      
      expect(mockInit).not.toHaveBeenCalled();
    });

    it("should not initialize when window is undefined", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      const originalWindow = global.window;
      delete (global as any).window;
      
      const { initPosthogClient } = await import("./posthog.client");
      await initPosthogClient(null);
      
      expect(mockInit).not.toHaveBeenCalled();
      
      global.window = originalWindow;
    });

    it("should initialize PostHog with API key when provided", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      const { initPosthogClient } = await import("./posthog.client");
      
      await initPosthogClient(null);
      
      expect(mockInit).toHaveBeenCalledWith("test-key", expect.objectContaining({
        api_host: "https://us.posthog.com",
      }));
    });

    it("should identify user when user is provided", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      const user: UserViewModel = {
        id: "test-user-id",
        email: "test@example.com",
      };
      
      let loadedCallback: ((ph: any) => void) | undefined;
      mockInit.mockImplementation((apiKey: string, options: any) => {
        if (options.loaded) {
          loadedCallback = options.loaded;
        }
      });
      
      const { initPosthogClient } = await import("./posthog.client");
      await initPosthogClient(user);
      
      if (loadedCallback) {
        const mockPh = {
          identify: mockIdentify,
        };
        loadedCallback(mockPh);
        
        expect(mockIdentify).toHaveBeenCalledWith("test-user-id", {
          email_domain: "example.com",
        });
      }
    });

    it("should not identify user when user is null", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      
      let loadedCallback: ((ph: any) => void) | undefined;
      mockInit.mockImplementation((apiKey: string, options: any) => {
        if (options.loaded) {
          loadedCallback = options.loaded;
        }
      });
      
      const { initPosthogClient } = await import("./posthog.client");
      await initPosthogClient(null);
      
      if (loadedCallback) {
        const mockPh = {
          identify: mockIdentify,
        };
        loadedCallback(mockPh);
        
        expect(mockIdentify).not.toHaveBeenCalled();
      }
    });
  });

  describe("captureClientEvent", () => {
    it("should not capture event when window is undefined", async () => {
      const originalWindow = global.window;
      delete (global as any).window;
      
      const { captureClientEvent } = await import("./posthog.client");
      captureClientEvent("test_event", { custom_prop: "value" });
      
      expect(mockCapture).not.toHaveBeenCalled();
      
      global.window = originalWindow;
    });

    it("should capture event with properties when initialized", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      const { initPosthogClient, captureClientEvent } = await import("./posthog.client");
      
      await initPosthogClient(null);
      captureClientEvent("test_event", { custom_prop: "value", user_id: "test-user" });
      
      expect(mockCapture).toHaveBeenCalledWith("test_event", {
        custom_prop: "value",
        user_id: "test-user",
      });
    });

    it("should capture event without properties when initialized", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      const { initPosthogClient, captureClientEvent } = await import("./posthog.client");
      
      await initPosthogClient(null);
      captureClientEvent("test_event");
      
      expect(mockCapture).toHaveBeenCalledWith("test_event", undefined);
    });

    it("should handle errors gracefully", async () => {
      __setPosthogClientConfig({ apiKey: "test-key" });
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const { initPosthogClient, captureClientEvent } = await import("./posthog.client");
      await initPosthogClient(null);
      
      mockCapture.mockImplementation(() => {
        throw new Error("PostHog capture error");
      });
      
      captureClientEvent("test_event", { custom_prop: "value" });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to capture PostHog client event:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});

