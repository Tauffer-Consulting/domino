import { useEffect } from "react";

type Callback = (() => void) | (() => Promise<void>);

/**
 * @param callback this function will be called when the interval arrive, make sure to save your data in a properly location
 * @param interval in milliseconds
 */
export const useInterval = (callback: Callback, interval: number) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      void callback();
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, [callback]);
};
