declare global {
  type FunctionOrPromiseReturnType<T> = T extends (
    instance: ReactFlowInstance<NodeData, EdgeData>,
  ) => infer R
    ? R
    : T extends (
        instance: ReactFlowInstance<NodeData, EdgeData>,
      ) => Promise<infer R>
    ? R
    : never;
}
export {};
