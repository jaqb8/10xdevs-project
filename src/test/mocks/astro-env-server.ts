export let POSTHOG_PROJECT_API_KEY: string | undefined = undefined;
export let POSTHOG_HOST: string | undefined = undefined;
export let POSTHOG_DISABLED: boolean = false;

export const __setPosthogConfig = (config: { apiKey?: string; host?: string; disabled?: boolean }) => {
  POSTHOG_PROJECT_API_KEY = config.apiKey;
  POSTHOG_HOST = config.host;
  POSTHOG_DISABLED = config.disabled ?? false;
};

export const __resetPosthogConfig = () => {
  POSTHOG_PROJECT_API_KEY = undefined;
  POSTHOG_HOST = undefined;
  POSTHOG_DISABLED = false;
};
