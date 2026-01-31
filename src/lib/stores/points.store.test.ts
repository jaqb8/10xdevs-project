import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { usePointsStore } from "./points.store";

describe("usePointsStore", () => {
  beforeEach(() => {
    usePointsStore.setState({
      correctAnalyses: null,
      totalAnalyses: null,
      lastModifiedAt: null,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have null correctAnalyses initially", () => {
      const { correctAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBeNull();
    });

    it("should have null totalAnalyses initially", () => {
      const { totalAnalyses } = usePointsStore.getState();
      expect(totalAnalyses).toBeNull();
    });

    it("should have null lastModifiedAt initially", () => {
      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBeNull();
    });
  });

  describe("setStats", () => {
    it("should set stats to specified values", () => {
      const { setStats } = usePointsStore.getState();

      setStats({ correctAnalyses: 10, totalAnalyses: 15 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(10);
      expect(totalAnalyses).toBe(15);
    });

    it("should update lastModifiedAt when setting stats", () => {
      const { setStats } = usePointsStore.getState();
      vi.setSystemTime(new Date("2026-01-22T12:00:00Z"));

      setStats({ correctAnalyses: 5, totalAnalyses: 10 });

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBe(new Date("2026-01-22T12:00:00Z").getTime());
    });

    it("should allow setting stats to null", () => {
      const { setStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 50, totalAnalyses: 60 });
      setStats(null);

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBeNull();
      expect(totalAnalyses).toBeNull();
    });

    it("should allow setting stats to zeros", () => {
      const { setStats } = usePointsStore.getState();

      setStats({ correctAnalyses: 0, totalAnalyses: 0 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(0);
      expect(totalAnalyses).toBe(0);
    });
  });

  describe("initializeStats", () => {
    it("should set stats when lastModifiedAt is null", () => {
      const { initializeStats } = usePointsStore.getState();

      initializeStats({ correctAnalyses: 100, totalAnalyses: 120 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(100);
      expect(totalAnalyses).toBe(120);
    });

    it("should set lastModifiedAt when initializing", () => {
      const { initializeStats } = usePointsStore.getState();
      vi.setSystemTime(new Date("2026-01-22T14:00:00Z"));

      initializeStats({ correctAnalyses: 100, totalAnalyses: 100 });

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBe(new Date("2026-01-22T14:00:00Z").getTime());
    });

    it("should NOT overwrite stats if lastModifiedAt is already set", () => {
      const { initializeStats, incrementStats } = usePointsStore.getState();

      initializeStats({ correctAnalyses: 100, totalAnalyses: 100 });
      incrementStats(true);
      initializeStats({ correctAnalyses: 50, totalAnalyses: 50 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(101);
      expect(totalAnalyses).toBe(101);
    });

    it("should NOT overwrite stats after setStats was called", () => {
      const { initializeStats, setStats } = usePointsStore.getState();

      setStats({ correctAnalyses: 200, totalAnalyses: 250 });
      initializeStats({ correctAnalyses: 50, totalAnalyses: 50 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(200);
      expect(totalAnalyses).toBe(250);
    });

    it("should prevent race condition when fetch returns after increment", () => {
      const { initializeStats, incrementStats } = usePointsStore.getState();

      initializeStats({ correctAnalyses: 10, totalAnalyses: 10 });
      incrementStats(true);
      incrementStats(false);
      initializeStats({ correctAnalyses: 10, totalAnalyses: 10 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(11);
      expect(totalAnalyses).toBe(12);
    });
  });

  describe("incrementStats", () => {
    it("should increment both counts when isCorrect is true", () => {
      const { setStats, incrementStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 5, totalAnalyses: 10 });

      incrementStats(true);

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(6);
      expect(totalAnalyses).toBe(11);
    });

    it("should only increment totalAnalyses when isCorrect is false", () => {
      const { setStats, incrementStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 5, totalAnalyses: 10 });

      incrementStats(false);

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(5);
      expect(totalAnalyses).toBe(11);
    });

    it("should set stats from null to initial values", () => {
      const { incrementStats } = usePointsStore.getState();

      incrementStats(true);

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(1);
      expect(totalAnalyses).toBe(1);
    });

    it("should handle first incorrect analysis from null state", () => {
      const { incrementStats } = usePointsStore.getState();

      incrementStats(false);

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(0);
      expect(totalAnalyses).toBe(1);
    });

    it("should update lastModifiedAt on increment", () => {
      const { incrementStats } = usePointsStore.getState();
      vi.setSystemTime(new Date("2026-01-22T15:00:00Z"));

      incrementStats(true);

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBe(new Date("2026-01-22T15:00:00Z").getTime());
    });

    it("should increment multiple times correctly", () => {
      const { setStats, incrementStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 0, totalAnalyses: 0 });

      incrementStats(true);
      incrementStats(false);
      incrementStats(true);

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(2);
      expect(totalAnalyses).toBe(3);
    });
  });

  describe("clearStats", () => {
    it("should reset correctAnalyses to null", () => {
      const { setStats, clearStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 100, totalAnalyses: 150 });

      clearStats();

      const { correctAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBeNull();
    });

    it("should reset totalAnalyses to null", () => {
      const { setStats, clearStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 100, totalAnalyses: 150 });

      clearStats();

      const { totalAnalyses } = usePointsStore.getState();
      expect(totalAnalyses).toBeNull();
    });

    it("should reset lastModifiedAt to null", () => {
      const { setStats, clearStats } = usePointsStore.getState();
      setStats({ correctAnalyses: 100, totalAnalyses: 150 });

      clearStats();

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBeNull();
    });

    it("should allow initialize to work again after clear", () => {
      const { initializeStats, incrementStats, clearStats } = usePointsStore.getState();

      initializeStats({ correctAnalyses: 100, totalAnalyses: 100 });
      incrementStats(true);
      clearStats();
      initializeStats({ correctAnalyses: 50, totalAnalyses: 60 });

      const { correctAnalyses, totalAnalyses } = usePointsStore.getState();
      expect(correctAnalyses).toBe(50);
      expect(totalAnalyses).toBe(60);
    });
  });
});
