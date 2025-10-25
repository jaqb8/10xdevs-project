import featureFlagsConfig, { type Environment, type Feature } from "./feature-flags.config";

const getEnvironment = (): Environment => {
  const env = import.meta.env.PUBLIC_ENV_NAME || import.meta.env.ENV_NAME;
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
