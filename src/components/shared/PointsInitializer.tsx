import { useEffect } from "react";
import type { InitialUserDataStatus } from "@/lib/fetch-initial-user-data";
import { usePointsStore } from "@/lib/stores/points.store";

interface PointsInitializerProps {
  initialPoints: number | null;
  status: InitialUserDataStatus;
}

export function PointsInitializer({ initialPoints, status }: PointsInitializerProps) {
  const initializePoints = usePointsStore((state) => state.initializePoints);
  const clearPoints = usePointsStore((state) => state.clearPoints);

  useEffect(() => {
    if (status === "unauthenticated") {
      clearPoints();
      return;
    }

    if (initialPoints === null) {
      return;
    }

    initializePoints(initialPoints);
  }, [initialPoints, status, initializePoints, clearPoints]);

  return null;
}
