import { useEffect } from "react";

type SaveFunction = (() => void) | (() => Promise<void>);

/**
 * @param saveFunction this function will be called when the interval arrive, make sure to save your data in a properly location
 * @param interval in milliseconds
 */
export const useInterval = (saveFunction: SaveFunction, interval: number) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      void saveFunction();
    }, interval);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
};
