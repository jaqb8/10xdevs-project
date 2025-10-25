export type Feature = "auth" | "learning-items";
export type Environment = "local" | "integration" | "production";

const featureFlagsConfig: Record<Environment, Record<Feature, boolean>> = {
  local: {
    auth: true,
    "learning-items": true,
  },
  integration: {
    auth: true,
    "learning-items": true,
  },
  production: {
    auth: false,
    "learning-items": false,
  },
};

export default featureFlagsConfig;
