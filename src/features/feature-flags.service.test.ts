import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { __setEnv, __resetEnv } from "../test/mocks/astro-env-client";
import { isFeatureEnabled } from "./feature-flags.service";

describe("feature-flags.service", () => {
  beforeEach(() => {
    __resetEnv();
  });

  afterEach(() => {
    __resetEnv();
  });

  describe("isFeatureEnabled", () => {
    describe("when environment is 'local'", () => {
      it("should return true for 'auth' feature", () => {
        __setEnv("local");
        expect(isFeatureEnabled("auth")).toBe(true);
      });

      it("should return true for 'learning-items' feature", () => {
        __setEnv("local");
        expect(isFeatureEnabled("learning-items")).toBe(true);
      });
    });

    describe("when environment is 'integration'", () => {
      it("should return true for 'auth' feature", () => {
        __setEnv("integration");
        expect(isFeatureEnabled("auth")).toBe(true);
      });

      it("should return true for 'learning-items' feature", () => {
        __setEnv("integration");
        expect(isFeatureEnabled("learning-items")).toBe(true);
      });
    });

    describe("when environment is 'production'", () => {
      it("should return false for 'auth' feature", () => {
        __setEnv("production");
        expect(isFeatureEnabled("auth")).toBe(false);
      });

      it("should return false for 'learning-items' feature", () => {
        __setEnv("production");
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });

    describe("when PUBLIC_ENV_NAME is not set", () => {
      it("should fallback to ENV_NAME", () => {
        __setEnv("local");
        expect(isFeatureEnabled("auth")).toBe(true);
      });
    });

    describe("when environment is invalid", () => {
      it("should default to 'production' and return false for features", () => {
        __setEnv("invalid-env");
        expect(isFeatureEnabled("auth")).toBe(false);
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });

    describe("when both PUBLIC_ENV_NAME and ENV_NAME are not set", () => {
      it("should default to 'production' and return false for features", () => {
        __resetEnv();
        expect(isFeatureEnabled("auth")).toBe(false);
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });

    describe("when environment is empty string", () => {
      it("should default to 'production' and return false for features", () => {
        __setEnv("");
        expect(isFeatureEnabled("auth")).toBe(false);
        expect(isFeatureEnabled("learning-items")).toBe(false);
      });
    });
  });
});
