import { useEffect, useRef } from "react";

type Callback = ((...args: any[]) => void) | (() => Promise<void>);

/**
 * @param callback this function will be called when the interval arrive, make sure to save your data in a properly location
 * @param interval in milliseconds
 */
export const useInterval = (
  callback: Callback,
  interval: number,
  shouldIntervalRun: boolean = true,
) => {
  const intervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldIntervalRun) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    if (intervalIdRef.current === null) {
      intervalIdRef.current = setInterval(() => {
        void callback();
      }, interval) as unknown as number;
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [callback, interval, shouldIntervalRun]);
};
