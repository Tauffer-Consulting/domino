export interface IAuthenticationStore {
  token: string | null;
  userId: string | null;
}

export interface IAuthenticationContext {
  store: IAuthenticationStore;
  isLogged: boolean;
  authLoading: boolean;
  logout: () => void;
  authenticate: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}
