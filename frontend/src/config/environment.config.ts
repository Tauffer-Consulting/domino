type DeployMode = "local-compose" | "local-k8s-dev" | "local-k8s";

export interface IEnvironment {
  API_URL: string;
  DOMINO_DEPLOY_MODE: DeployMode;
}

export const environment: IEnvironment = {
  API_URL: import.meta.env.API_URL as string,
  DOMINO_DEPLOY_MODE: import.meta.env.DOMINO_DEPLOY_MODE as DeployMode,
};
