import { useCallback } from "react";
import type { ApiErrorResponse, UserSettings } from "@/types";

type SettingsActionResult<T> = { data: T; errorMessage?: undefined } | { data: null; errorMessage: string };

const mapErrorCodeToMessage = (errorCode: string): string => {
  const messages: Record<string, string> = {
    authentication_error_unauthorized: "Twoja sesja wygasła. Zaloguj się ponownie.",
    validation_error_settings_empty: "Wybierz ustawienie do aktualizacji.",
    database_error: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.",
    unknown_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
  };

  return messages[errorCode] ?? messages.unknown_error;
};

export function useSettingsActions() {
  const updateSettings = useCallback(
    async (payload: Partial<UserSettings>): Promise<SettingsActionResult<UserSettings>> => {
      try {
        const response = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as ApiErrorResponse | null;
          return { data: null, errorMessage: mapErrorCodeToMessage(errorData?.error_code ?? "unknown_error") };
        }

        return { data: (await response.json()) as UserSettings };
      } catch (error) {
        console.error("Failed to update settings:", error);
        return { data: null, errorMessage: mapErrorCodeToMessage("unknown_error") };
      }
    },
    []
  );

  const resetPoints = useCallback(async (): Promise<SettingsActionResult<true>> => {
    try {
      const response = await fetch("/api/gamification/reset", { method: "DELETE" });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as ApiErrorResponse | null;
        return { data: null, errorMessage: mapErrorCodeToMessage(errorData?.error_code ?? "unknown_error") };
      }

      return { data: true };
    } catch (error) {
      console.error("Failed to reset points:", error);
      return { data: null, errorMessage: mapErrorCodeToMessage("unknown_error") };
    }
  }, []);

  return { updateSettings, resetPoints };
}
