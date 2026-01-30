import { useEffect } from "react";
import { usePointsStore } from "@/lib/stores/points.store";

interface PointsInitializerProps {
  initialPoints: number | null;
}

export function PointsInitializer({ initialPoints }: PointsInitializerProps) {
  const initializePoints = usePointsStore((state) => state.initializePoints);
  const clearPoints = usePointsStore((state) => state.clearPoints);

  useEffect(() => {
    if (initialPoints === null) {
      clearPoints();
      return;
    }

    initializePoints(initialPoints);
  }, [initialPoints, initializePoints, clearPoints]);

  return null;
}
