export let PUBLIC_ENV_NAME = "production";

export const __setEnv = (envName: string) => {
  PUBLIC_ENV_NAME = envName;
};

export const __resetEnv = () => {
  PUBLIC_ENV_NAME = "production";
};

export let PUBLIC_POSTHOG_PROJECT_API_KEY: string | undefined = undefined;
export let PUBLIC_POSTHOG_HOST: string | undefined = undefined;
export let PUBLIC_POSTHOG_DISABLED: boolean = false;

export const __setPosthogClientConfig = (config: { apiKey?: string; host?: string; disabled?: boolean }) => {
  PUBLIC_POSTHOG_PROJECT_API_KEY = config.apiKey;
  PUBLIC_POSTHOG_HOST = config.host;
  PUBLIC_POSTHOG_DISABLED = config.disabled ?? false;
};

export const __resetPosthogClientConfig = () => {
  PUBLIC_POSTHOG_PROJECT_API_KEY = undefined;
  PUBLIC_POSTHOG_HOST = undefined;
  PUBLIC_POSTHOG_DISABLED = false;
};
