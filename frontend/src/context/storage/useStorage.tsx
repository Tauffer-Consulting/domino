import { createCustomContext } from "@utils/createCustomContext.function";
import React, { type ReactNode, useCallback } from "react";

import { stringifyOrKepOriginal, tryParseJSON } from "./utils/parseJson";

interface IStorageContext {
  getItem: <T = string>(key: string) => T | null;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

export const [StorageContext, useStorage] =
  createCustomContext<IStorageContext>("Storage Context");

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
