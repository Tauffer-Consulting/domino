import { type taskState } from "features/myWorkflows/types";
import { type CSSProperties } from "react";
import { type Node, type NodeProps } from "reactflow";

interface IStyleData {
  nodeType: "default" | "source" | "sink";
  nodeStyle: CSSProperties;
  useIcon: boolean;
  iconId: string;
  iconClassName: string;
  iconStyle: CSSProperties;
  label: string;
  module: string;
}

interface RunNodeData {
  taskId: string;
  name: string;
  style: IStyleData;
  state: taskState;
  orientation: "vertical" | "horizontal";
}

export type RunNode = Node<RunNodeData>;

export interface RunNodeProps extends NodeProps {
  data: RunNodeData;
}
