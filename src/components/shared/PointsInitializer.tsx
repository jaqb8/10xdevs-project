import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePointsStore } from "@/lib/stores/points.store";

export function PointsInitializer() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const setPoints = usePointsStore((state) => state.setPoints);
  const clearPoints = usePointsStore((state) => state.clearPoints);

  useEffect(() => {
    if (!isAuth) {
      clearPoints();
      return;
    }

    const fetchPoints = async () => {
      try {
        const response = await fetch("/api/gamification/points");
        if (response.ok) {
          const data = await response.json();
          setPoints(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch points:", error);
      }
    };

    fetchPoints();
  }, [isAuth, setPoints, clearPoints]);

  return null;
}
