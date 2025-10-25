import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { __setEnv, __resetEnv } from "../test/mocks/astro-env-client";
import { isFeatureEnabled } from "./feature-flags.service";
import featureFlagsConfig from "./feature-flags.config";

describe("feature-flags.service", () => {
  beforeEach(() => {
    __resetEnv();
  });

  afterEach(() => {
    __resetEnv();
  });

  describe("isFeatureEnabled", () => {
    describe("configuration reading", () => {
      it("should read feature flag from config for 'local' environment", () => {
        __setEnv("local");
        const authEnabled = isFeatureEnabled("auth");
        expect(authEnabled).toBe(featureFlagsConfig.local.auth);
      });

      it("should read feature flag from config for 'integration' environment", () => {
        __setEnv("integration");
        const authEnabled = isFeatureEnabled("auth");
        expect(authEnabled).toBe(featureFlagsConfig.integration.auth);
      });

      it("should read feature flag from config for 'production' environment", () => {
        __setEnv("production");
        const authEnabled = isFeatureEnabled("auth");
        expect(authEnabled).toBe(featureFlagsConfig.production.auth);
      });

      it("should handle all defined features", () => {
        __setEnv("local");
        const authEnabled = isFeatureEnabled("auth");
        const learningItemsEnabled = isFeatureEnabled("learning-items");

        expect(authEnabled).toBe(featureFlagsConfig.local.auth);
        expect(learningItemsEnabled).toBe(featureFlagsConfig.local["learning-items"]);
      });
    });

    describe("environment fallback", () => {
      it("should default to 'production' when environment is invalid", () => {
        __setEnv("invalid-env");
        const authEnabled = isFeatureEnabled("auth");
        expect(authEnabled).toBe(featureFlagsConfig.production.auth);
      });

      it("should default to 'production' when environment is not set", () => {
        __resetEnv();
        const authEnabled = isFeatureEnabled("auth");
        expect(authEnabled).toBe(featureFlagsConfig.production.auth);
      });

      it("should default to 'production' when environment is empty string", () => {
        __setEnv("");
        const authEnabled = isFeatureEnabled("auth");
        expect(authEnabled).toBe(featureFlagsConfig.production.auth);
      });
    });

    describe("error handling", () => {
      it("should return false when environment config is missing", () => {
        __setEnv("production");
        vi.spyOn(featureFlagsConfig, "production", "get").mockReturnValue(undefined as any);

        const result = isFeatureEnabled("auth");
        expect(result).toBe(false);

        vi.restoreAllMocks();
      });

      it("should return false when feature is not defined in config", () => {
        __setEnv("local");
        const config = { ...featureFlagsConfig.local };
        delete (config as any).auth;
        vi.spyOn(featureFlagsConfig, "local", "get").mockReturnValue(config);

        const result = isFeatureEnabled("auth");
        expect(result).toBe(false);

        vi.restoreAllMocks();
      });
    });
  });
});
