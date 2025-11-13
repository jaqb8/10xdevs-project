export let PUBLIC_ENV_NAME = "production";

export const __setEnv = (envName: string) => {
  PUBLIC_ENV_NAME = envName;
};

export const __resetEnv = () => {
  PUBLIC_ENV_NAME = "production";
};
