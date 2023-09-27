import { type taskState } from "features/workflows/types";
import { type CSSProperties } from "react";
import { type Node, type NodeProps } from "reactflow";

interface IStyleData {
  nodeType: "default" | "input" | "output";
  nodeStyle: CSSProperties;
  useIcon: boolean;
  iconId: string;
  iconClassName: string;
  iconStyle: CSSProperties;
  label: string;
  module: string;
}

interface DefaultNodeData {
  name: string;
  style: IStyleData;
  validationError: boolean;
}

interface RunNodeData {
  name: string;
  style: IStyleData;
  state: taskState;
}

export type DefaultNode = Node<DefaultNodeData>;
export type RunNode = Node<RunNodeData>;

export interface DefaultNodeProps extends NodeProps {
  data: DefaultNodeData;
}

export interface RunNodeProps extends NodeProps {
  data: RunNodeData;
}
