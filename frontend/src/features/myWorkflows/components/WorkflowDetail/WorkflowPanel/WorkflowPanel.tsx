import theme from "providers/theme.config";
import React, {
  useCallback,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
  useMemo,
} from "react";
import ReactFlow, {
  type Node,
  Background,
  Controls,
  ReactFlowProvider,
  type Edge,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  type ReactFlowInstance,
  MarkerType,
  type EdgeTypes,
  type NodeTypes,
} from "reactflow";

import DefaultEdge from "./DefaultEdge";
import RunNodeComponent from "./RunNode";
import "reactflow/dist/style.css";
import { type RunNode } from "./types";

const RUN_NODE_TYPES: NodeTypes = {
  CustomNode: RunNodeComponent,
};

const EDGE_TYPES: EdgeTypes = {
  default: DefaultEdge,
};

type OnInit<NodeData = any, EdgeData = any> =
  | ((instance: ReactFlowInstance<NodeData, EdgeData>) => {
      nodes: Node[];
      edges: Edge[];
    })
  | ((
      instance: ReactFlowInstance<NodeData, EdgeData>,
    ) => Promise<{ nodes: Node[]; edges: Edge[] }>);

interface Props {
  onInit?: OnInit;
  onNodeDoubleClick?: NodeMouseHandler;
}
export interface WorkflowPanelRef {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}
const WorkflowPanel = forwardRef<WorkflowPanelRef, Props>(
  (props: Props, ref: ForwardedRef<WorkflowPanelRef>) => {
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
    const [rawNodes, setNodes] = useNodesState([]);
    const [rawEdges, setEdges] = useEdgesState([]);

    const onInit = useCallback(
      async (instance: ReactFlowInstance) => {
        setInstance(instance);
        if (props.onInit) {
          const result = props.onInit(instance);
          if (result instanceof Promise) {
            result
              .then(({ nodes, edges }) => {
                setNodes(nodes);
                setEdges(edges);
              })
              .catch((error) => {
                console.error("Error from Promise-returning function:", error);
              });
          } else {
            const { nodes, edges } = result;
            setNodes(nodes);
            setEdges(edges);
          }
        }
        window.requestAnimationFrame(() => instance.fitView());
      },
      [props],
    );

    const onNodeDoubleClick = useCallback<NodeMouseHandler>(
      (e, n) => {
        if (props.onNodeDoubleClick) {
          props.onNodeDoubleClick(e, n);
        }
        if (instance) {
          const nodeCenter = (n.width ?? 0) / 2;
          instance.setCenter(n.position.x + nodeCenter, n.position.y);
        }
      },
      [instance, props],
    );

    const { nodes, edges } = useMemo(() => {
      const nodes = [...rawNodes].map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
        },
      }));

      const edges = [...rawEdges].map((edge: Edge) => {
        const animated = nodes.some(
          (n: RunNode) =>
            (n.id === edge.source || n.id === edge.target) &&
            n.data?.state === "running",
        );

        return {
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          animated,
        };
      });

      return {
        nodes,
        edges,
      };
    }, [rawNodes, rawEdges]);

    useImperativeHandle(
      ref,
      () => {
        return {
          edges: rawEdges,
          nodes: rawNodes,
          setEdges,
          setNodes,
        };
      },
      [rawEdges, rawNodes, setEdges, setNodes],
    );

    return (
      <ReactFlowProvider>
        <div
          className="reactflow-wrapper"
          ref={reactFlowWrapper}
          style={{ height: "100%", width: "100%" }}
        >
          <ReactFlow
            nodeTypes={RUN_NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            nodes={nodes}
            edges={edges}
            onInit={onInit}
            onNodeDoubleClick={onNodeDoubleClick}
            fitView={true}
            nodesConnectable={false}
          >
            <Controls
              showInteractive={false}
              position="bottom-center"
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            />
            <Background color={theme.palette.grey[800]} gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    );
  },
);

WorkflowPanel.displayName = "WorkflowPanel";

export { WorkflowPanel };
