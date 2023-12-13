/**
 * @todo add other envs when available
 */
export type INodeEnv = "development";
export type IApiEnv = "local" | "dev" | "prod";

export interface IEnvironment {
  NODE_ENV: INodeEnv;
  API_ENV: IApiEnv;
  USE_MOCK: boolean;
  API_URL: string;
}

/**
 * Stores all environment variables for easier access
 */
export const environment: IEnvironment = {
  NODE_ENV: import.meta.env.NODE_ENV as INodeEnv,
  API_ENV: import.meta.env.API_ENV as IApiEnv,
  API_URL: import.meta.env.API_URL as string,
  USE_MOCK: !!import.meta.env.VITE_USE_MOCK,
};
