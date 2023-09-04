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
