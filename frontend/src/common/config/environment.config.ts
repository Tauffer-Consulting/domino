import {
  type IEnvironment,
  type INodeEnv,
  type IApiEnv,
} from "common/interfaces/environment.interface";

/**
 * Stores all environment variables for easier access
 */
export const environment: IEnvironment = {
  NODE_ENV: process.env.NODE_ENV as INodeEnv,
  API_ENV: process.env.REACT_APP_API_ENV as IApiEnv,
  USE_MOCK: !!process.env.REACT_APP_USE_MOCK,
};
