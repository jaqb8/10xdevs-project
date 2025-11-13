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
      flushAt: 1,
      flushInterval: 0,
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
  captureImmediate: () => Promise.resolve(),
  identify: () => {
    // no-op
  },
  identifyImmediate: () => Promise.resolve(),
  shutdown: () => Promise.resolve(),
};

export function getPosthog() {
  const instance = getPosthogInstance();
  return instance || noOpClient;
}

export function captureServerEvent<T extends Record<string, unknown>>(
  eventName: string,
  properties?: T,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  const posthog = getPosthog();
  if (posthog === noOpClient) {
    return;
  }

  const capturePromise = (posthog as PostHog)
    .captureImmediate({
      distinctId: (properties?.user_id as string) || "anonymous",
      event: eventName,
      properties,
    })
    .catch((error) => {
      console.error("Failed to capture PostHog event:", error);
    });

  if (waitUntil) {
    waitUntil(capturePromise);
  } else {
    capturePromise.catch(() => {
      // Error already logged above
    });
  }
}

export function identifyServerUser(
  userId: string,
  traits?: Record<string, unknown>,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  const posthog = getPosthog();
  if (posthog === noOpClient) {
    return;
  }

  const identifyPromise = (posthog as PostHog)
    .identifyImmediate({
      distinctId: userId,
      properties: traits,
    })
    .catch((error) => {
      console.error("Failed to identify PostHog user:", error);
    });

  if (waitUntil) {
    waitUntil(identifyPromise);
  } else {
    identifyPromise.catch(() => {
      // Error already logged above
    });
  }
}

export function shutdownPosthog(waitUntil?: (promise: Promise<unknown>) => void) {
  if (!posthogInstance) {
    return;
  }

  const shutdownPromise = posthogInstance
    .shutdown()
    .then(() => {
      posthogInstance = null;
    })
    .catch((error) => {
      console.error("Failed to shutdown PostHog:", error);
    });

  if (waitUntil) {
    waitUntil(shutdownPromise);
  } else {
    shutdownPromise.catch(() => {
      // Error already logged above
    });
  }
}
