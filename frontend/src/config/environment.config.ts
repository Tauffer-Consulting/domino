export interface IEnvironment {
  API_URL: string;
}

export const environment: IEnvironment = {
  API_URL: import.meta.env.API_URL as string,
};
