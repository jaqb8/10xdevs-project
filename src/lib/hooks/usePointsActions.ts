import { useCallback } from "react";
import type { ApiErrorResponse, AnalysisStats } from "@/types";

type StatsActionResult<T> = { data: T; errorMessage?: undefined } | { data: null; errorMessage: string };

const mapErrorCodeToMessage = (errorCode: string): string => {
  const messages: Record<string, string> = {
    authentication_error_unauthorized: "Musisz być zalogowany, aby pobrać statystyki.",
    database_error: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
  };

  return messages[errorCode] ?? messages.unknown_error;
};

export function usePointsActions() {
  const fetchStats = useCallback(async (): Promise<StatsActionResult<AnalysisStats>> => {
    try {
      const response = await fetch("/api/gamification/points");
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        return { data: null, errorMessage: mapErrorCodeToMessage(errorData?.error_code ?? "unknown_error") };
      }

      const data = (await response.json()) as AnalysisStats;
      return { data };
    } catch (error) {
      console.error("Failed to fetch analysis stats:", error);
      return { data: null, errorMessage: mapErrorCodeToMessage("unknown_error") };
    }
  }, []);

  return { fetchStats };
}
