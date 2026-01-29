import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useSettingsStore } from "@/lib/stores/settings.store";

export function SettingsInitializer() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  const clearSettings = useSettingsStore((state) => state.clearSettings);
  const isLoaded = useSettingsStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isAuth) {
      clearSettings();
      return;
    }

    if (isLoaded) {
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          initializeSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, [isAuth, isLoaded, initializeSettings, clearSettings]);

  return null;
}
