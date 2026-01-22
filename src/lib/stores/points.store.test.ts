import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { usePointsStore } from "./points.store";

describe("usePointsStore", () => {
  beforeEach(() => {
    usePointsStore.setState({
      points: null,
      lastModifiedAt: null,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have null points initially", () => {
      const { points } = usePointsStore.getState();
      expect(points).toBeNull();
    });

    it("should have null lastModifiedAt initially", () => {
      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBeNull();
    });
  });

  describe("setPoints", () => {
    it("should set points to specified value", () => {
      const { setPoints } = usePointsStore.getState();

      setPoints(42);

      const { points } = usePointsStore.getState();
      expect(points).toBe(42);
    });

    it("should update lastModifiedAt when setting points", () => {
      const { setPoints } = usePointsStore.getState();
      vi.setSystemTime(new Date("2026-01-22T12:00:00Z"));

      setPoints(10);

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBe(new Date("2026-01-22T12:00:00Z").getTime());
    });

    it("should allow setting points to null", () => {
      const { setPoints } = usePointsStore.getState();
      setPoints(50);
      setPoints(null);

      const { points } = usePointsStore.getState();
      expect(points).toBeNull();
    });

    it("should allow setting points to 0", () => {
      const { setPoints } = usePointsStore.getState();

      setPoints(0);

      const { points } = usePointsStore.getState();
      expect(points).toBe(0);
    });
  });

  describe("initializePoints", () => {
    it("should set points when lastModifiedAt is null", () => {
      const { initializePoints } = usePointsStore.getState();

      initializePoints(100);

      const { points } = usePointsStore.getState();
      expect(points).toBe(100);
    });

    it("should set lastModifiedAt when initializing", () => {
      const { initializePoints } = usePointsStore.getState();
      vi.setSystemTime(new Date("2026-01-22T14:00:00Z"));

      initializePoints(100);

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBe(new Date("2026-01-22T14:00:00Z").getTime());
    });

    it("should NOT overwrite points if lastModifiedAt is already set", () => {
      const { initializePoints, incrementPoints } = usePointsStore.getState();

      initializePoints(100);
      incrementPoints();
      initializePoints(50);

      const { points } = usePointsStore.getState();
      expect(points).toBe(101);
    });

    it("should NOT overwrite points after setPoints was called", () => {
      const { initializePoints, setPoints } = usePointsStore.getState();

      setPoints(200);
      initializePoints(50);

      const { points } = usePointsStore.getState();
      expect(points).toBe(200);
    });

    it("should prevent race condition when fetch returns after increment", () => {
      const { initializePoints, incrementPoints } = usePointsStore.getState();

      initializePoints(10);
      incrementPoints();
      incrementPoints();
      initializePoints(10);

      const { points } = usePointsStore.getState();
      expect(points).toBe(12);
    });
  });

  describe("incrementPoints", () => {
    it("should increment points by 1 when points exist", () => {
      const { setPoints, incrementPoints } = usePointsStore.getState();
      setPoints(5);

      incrementPoints();

      const { points } = usePointsStore.getState();
      expect(points).toBe(6);
    });

    it("should set points to 1 when points is null", () => {
      const { incrementPoints } = usePointsStore.getState();

      incrementPoints();

      const { points } = usePointsStore.getState();
      expect(points).toBe(1);
    });

    it("should increment from 0 to 1", () => {
      const { setPoints, incrementPoints } = usePointsStore.getState();
      setPoints(0);

      incrementPoints();

      const { points } = usePointsStore.getState();
      expect(points).toBe(1);
    });

    it("should update lastModifiedAt on increment", () => {
      const { incrementPoints } = usePointsStore.getState();
      vi.setSystemTime(new Date("2026-01-22T15:00:00Z"));

      incrementPoints();

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBe(new Date("2026-01-22T15:00:00Z").getTime());
    });

    it("should increment multiple times correctly", () => {
      const { setPoints, incrementPoints } = usePointsStore.getState();
      setPoints(0);

      incrementPoints();
      incrementPoints();
      incrementPoints();

      const { points } = usePointsStore.getState();
      expect(points).toBe(3);
    });
  });

  describe("clearPoints", () => {
    it("should reset points to null", () => {
      const { setPoints, clearPoints } = usePointsStore.getState();
      setPoints(100);

      clearPoints();

      const { points } = usePointsStore.getState();
      expect(points).toBeNull();
    });

    it("should reset lastModifiedAt to null", () => {
      const { setPoints, clearPoints } = usePointsStore.getState();
      setPoints(100);

      clearPoints();

      const { lastModifiedAt } = usePointsStore.getState();
      expect(lastModifiedAt).toBeNull();
    });

    it("should allow initialize to work again after clear", () => {
      const { initializePoints, incrementPoints, clearPoints } = usePointsStore.getState();

      initializePoints(100);
      incrementPoints();
      clearPoints();
      initializePoints(50);

      const { points } = usePointsStore.getState();
      expect(points).toBe(50);
    });
  });
});
