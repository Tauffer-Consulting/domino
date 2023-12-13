import { environment, type IApiEnv } from "config/environment.config";

interface IEndpoints {
  api: string;
}

/**
 * Stores all endpoints accessed by the application
 */
const configEndpoints: Record<IApiEnv, IEndpoints> = {
  local: {
    api: "http://localhost:8000/",
  },
  dev: {
    api: "http://localhost/api",
  },
  prod: {
    api: environment.API_URL,
  },
};

/**
 * Exports all endpoints, already set up by current env
 */
export const endpoints =
  configEndpoints[environment.API_ENV] ?? configEndpoints.dev;

export default endpoints;
