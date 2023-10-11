/**
 * @todo add other envs when available
 */
export type INodeEnv = "development";
export type IApiEnv = "local" | "dev" | "prod";

export interface IEnvironment {
  NODE_ENV: INodeEnv;
  API_ENV: IApiEnv;
  USE_MOCK: boolean;
}

/**
 * Stores all environment variables for easier access
 */
export const environment: IEnvironment = {
  NODE_ENV: import.meta.env.NODE_ENV as INodeEnv,
  API_ENV: import.meta.env.VITE_API_ENV as IApiEnv,
  USE_MOCK: !!import.meta.env.VITE_USE_MOCK,
};
