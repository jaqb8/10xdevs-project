import featureFlagsConfig, { type Environment, type Feature } from "./feature-flags.config";
import { PUBLIC_ENV_NAME } from "astro:env/client";

const getEnvironment = (): Environment => {
  const env = PUBLIC_ENV_NAME;
  if (env === "local" || env === "integration" || env === "production") {
    return env;
  }
  return "production";
};

export const isFeatureEnabled = (feature: Feature): boolean => {
  const environment = getEnvironment();
  const environmentConfig = featureFlagsConfig[environment];

  if (!environmentConfig) {
    return false;
  }

  return environmentConfig[feature] ?? false;
};
