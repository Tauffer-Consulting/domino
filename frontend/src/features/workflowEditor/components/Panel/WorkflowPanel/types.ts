import { type CSSProperties } from "react";
import { type Node, type NodeProps } from "reactflow";

export type DefaultNode = Node<DefaultNodeData>;

export interface DefaultNodeProps extends NodeProps {
  data: DefaultNodeData;
}

interface DefaultNodeData {
  name: string;
  style: IStyleData;
  validationError: boolean;
  orientation: "vertical" | "horizontal";
}

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
