import type { UserViewModel } from "@/types";
import { PUBLIC_POSTHOG_PROJECT_API_KEY, PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_DISABLED } from "astro:env/client";

let posthogClient: typeof import("posthog-js") | null = null;
let isInitialized = false;

async function loadPosthog() {
  if (posthogClient) {
    return posthogClient;
  }

  try {
    posthogClient = await import("posthog-js");
    return posthogClient;
  } catch (error) {
    console.error("Failed to load PostHog client:", error);
    return null;
  }
}

function getPosthogConfig() {
  const apiKey = PUBLIC_POSTHOG_PROJECT_API_KEY;
  const host = PUBLIC_POSTHOG_HOST || "https://us.posthog.com";
  const disabled = PUBLIC_POSTHOG_DISABLED;

  return { apiKey, host, disabled };
}

export async function initPosthogClient(user: UserViewModel | null) {
  if (isInitialized) {
    return;
  }

  const { apiKey, host, disabled } = getPosthogConfig();

  if (!apiKey || disabled || typeof window === "undefined") {
    return;
  }

  const posthog = await loadPosthog();
  if (!posthog) {
    return;
  }

  try {
    posthog.default.init(apiKey, {
      api_host: host,
      loaded: (ph) => {
        if (user) {
          ph.identify(user.id, {
            email_domain: user.email.split("@")[1],
          });
        }
      },
    });

    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize PostHog client:", error);
  }
}

export function captureClientEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined" || !isInitialized || !posthogClient) {
    return;
  }

  try {
    posthogClient.default.capture(eventName, properties);
  } catch (error) {
    console.error("Failed to capture PostHog client event:", error);
  }
}
