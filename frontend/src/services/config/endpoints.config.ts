import { environment } from "common/config/environment.config";
import { type IApiEnv } from "common/interfaces/environment.interface";

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
    api: "http://localhost/api",
  },
};

/**
 * Exports all endpoints, already set up by current env
 */
export const endpoints =
  configEndpoints[environment.API_ENV] ?? configEndpoints.dev;

export default endpoints;
