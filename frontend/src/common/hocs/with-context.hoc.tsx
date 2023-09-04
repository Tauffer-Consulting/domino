import { type FC, memo } from "react";

export function withContext<P>(Provider: FC<P>, Component: FC<P>): FC<P> {
  const MemoizedComponent = memo(Component);
  /**
   * @todo solve as any type
   */
  const WithContext: FC<P> = (props) => {
    return (
      <Provider {...props}>
        <MemoizedComponent {...(props as any)} />
      </Provider>
    );
  };

  return WithContext;
}
