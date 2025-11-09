import { PostHog } from "posthog-node";
import { POSTHOG_PROJECT_API_KEY, POSTHOG_HOST, POSTHOG_DISABLED } from "astro:env/server";

let posthogInstance: PostHog | null = null;

function getPosthogInstance(): PostHog | null {
  if (posthogInstance) {
    return posthogInstance;
  }

  const apiKey = POSTHOG_PROJECT_API_KEY;
  const host = POSTHOG_HOST || "https://us.posthog.com";
  const disabled = POSTHOG_DISABLED;

  if (!apiKey || disabled) {
    return null;
  }

  try {
    posthogInstance = new PostHog(apiKey, {
      host,
      flushAt: 20,
      flushInterval: 10000,
    });
    return posthogInstance;
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
    return null;
  }
}

const noOpClient = {
  capture: () => {
    // no-op
  },
  identify: () => {
    // no-op
  },
  shutdown: () => Promise.resolve(),
};

export function getPosthog() {
  const instance = getPosthogInstance();
  return instance || noOpClient;
}

export async function captureServerEvent<T extends Record<string, unknown>>(eventName: string, properties?: T) {
  const posthog = getPosthog();
  if (posthog === noOpClient) {
    return;
  }

  try {
    await posthog.capture({
      distinctId: (properties?.user_id as string) || "anonymous",
      event: eventName,
      properties,
    });
  } catch (error) {
    console.error("Failed to capture PostHog event:", error);
  }
}

export async function identifyServerUser(userId: string, traits?: Record<string, unknown>) {
  const posthog = getPosthog();
  if (posthog === noOpClient) {
    return;
  }

  try {
    await posthog.identify({
      distinctId: userId,
      properties: traits,
    });
  } catch (error) {
    console.error("Failed to identify PostHog user:", error);
  }
}

export async function shutdownPosthog() {
  if (posthogInstance) {
    await posthogInstance.shutdown();
    posthogInstance = null;
  }
}
