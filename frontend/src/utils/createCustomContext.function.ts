import { type Context, createContext, useContext } from "react";

/**
 * Creates a context without having to deal with pointless default values and null checks
 * @param T context interface
 * @param displayName (optional) devtools display name
 * @returns the context and its custom hook in an array: `[Context, useCustomContext]`
 *
 * @author rafasilveira
 */
export function createCustomContext<T>(
  /** The name that you want to display on the devtools */
  displayName?: string,
): [Context<T | null>, () => T] {
  const Context = createContext<T | null>(null);
  if (displayName) {
    Context.displayName = displayName;
  }
  function useCustomContext() {
    const context = useContext(Context);
    if (context === null) {
      throw new Error(
        `This hook must we used within ${displayName ?? "it's"} provider`,
      );
    } else {
      return context;
    }
  }
  return [Context, useCustomContext];
}
