import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/settings.store";

interface SettingsInitializerProps {
  initialSettings: { pointsEnabled: boolean; contextEnabled: boolean } | null;
}

export function SettingsInitializer({ initialSettings }: SettingsInitializerProps) {
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  const clearSettings = useSettingsStore((state) => state.clearSettings);

  useEffect(() => {
    if (initialSettings === null) {
      clearSettings();
      return;
    }

    initializeSettings(initialSettings);
  }, [initialSettings, initializeSettings, clearSettings]);

  return null;
}
