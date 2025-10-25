import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("feature-flags.service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("isFeatureEnabled", () => {
    describe("when environment is 'local'", () => {
      it("should return true for 'auth' feature", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "local");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(true);
      });

      it("should return true for 'learning-items' feature", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "local");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("learning-items")).toBe(true);
      });
    });

    describe("when environment is 'integration'", () => {
      it("should return true for 'auth' feature", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "integration");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(true);
      });

      it("should return true for 'learning-items' feature", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "integration");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("learning-items")).toBe(true);
      });
    });

    describe("when environment is 'production'", () => {
      it("should return false for 'auth' feature", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "production");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(false);
      });

      it("should return false for 'learning-items' feature", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "production");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });

    describe("when PUBLIC_ENV_NAME is not set", () => {
      it("should fallback to ENV_NAME", async () => {
        vi.stubEnv("ENV_NAME", "local");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(true);
      });
    });

    describe("when environment is invalid", () => {
      it("should default to 'production' and return false for features", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "invalid-env");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(false);
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });

    describe("when both PUBLIC_ENV_NAME and ENV_NAME are not set", () => {
      it("should default to 'production' and return false for features", async () => {
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(false);
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });

    describe("when environment is empty string", () => {
      it("should default to 'production' and return false for features", async () => {
        vi.stubEnv("PUBLIC_ENV_NAME", "");
        const { isFeatureEnabled } = await import("./feature-flags.service");
        expect(isFeatureEnabled("auth")).toBe(false);
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });
  });
});
