import { useEffect } from "react";
import type { InitialUserDataStatus } from "@/lib/fetch-initial-user-data";
import type { AnalysisStats } from "@/types";
import { usePointsStore } from "@/lib/stores/points.store";

interface PointsInitializerProps {
  initialStats: AnalysisStats | null;
  status: InitialUserDataStatus;
}

export function PointsInitializer({ initialStats, status }: PointsInitializerProps) {
  const initializeStats = usePointsStore((state) => state.initializeStats);
  const clearStats = usePointsStore((state) => state.clearStats);

  useEffect(() => {
    if (status === "unauthenticated") {
      clearStats();
      return;
    }

    if (initialStats === null) {
      return;
    }

    initializeStats(initialStats);
  }, [initialStats, status, initializeStats, clearStats]);

  return null;
}
