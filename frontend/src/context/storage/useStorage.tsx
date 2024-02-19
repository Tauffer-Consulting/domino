import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
} from "react";

import { stringifyOrKepOriginal, tryParseJSON } from "./utils/parseJson";

interface IStorageContext {
  getItem: <T = string>(key: string) => T | null;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const defaultStorageState = {
  getItem: (_k: string) => null,
  setItem: (_k: string, _v: string | object) => {},
  removeItem: (_k: string) => {},
  clear: () => {},
};

const StorageContext = createContext<IStorageContext>(defaultStorageState);

export function useStorage(): IStorageContext {
  const context = useContext(StorageContext);

  return context;
}

export const StorageProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const getItem = useCallback(function <T = string | null>(key: string) {
    const rawValue = localStorage.getItem(key);
    if (rawValue) {
      const value = tryParseJSON<T>(rawValue);
      return value as T;
    }
    return null;
  }, []);

  const setItem = useCallback(function (key: string, value: any) {
    if (value !== undefined) {
      localStorage.setItem(key, stringifyOrKepOriginal(value));
    }
  }, []);

  const clear = useCallback(() => {
    localStorage.clear();
  }, []);

  const removeItem = useCallback((key: string) => {
    localStorage.removeItem(key);
  }, []);

  const value: IStorageContext = {
    getItem,
    setItem,
    clear,
    removeItem,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};
