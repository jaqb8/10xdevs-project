import { useEffect } from "react";
import type { InitialUserDataStatus } from "@/lib/fetch-initial-user-data";
import type { UserSettings } from "@/types";
import { useSettingsStore } from "@/lib/stores/settings.store";

interface SettingsInitializerProps {
  initialSettings: UserSettings | null;
  status: InitialUserDataStatus;
}

export function SettingsInitializer({ initialSettings, status }: SettingsInitializerProps) {
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  const clearSettings = useSettingsStore((state) => state.clearSettings);

  useEffect(() => {
    if (status === "unauthenticated") {
      clearSettings();
      return;
    }

    if (initialSettings === null) {
      return;
    }

    initializeSettings(initialSettings);
  }, [initialSettings, status, initializeSettings, clearSettings]);

  return null;
}
