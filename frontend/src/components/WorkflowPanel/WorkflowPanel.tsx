import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Elk from "elkjs";
import theme from "providers/theme.config";
import React, {
  useCallback,
  type DragEvent,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
  useMemo,
  useEffect,
} from "react";
import ReactFlow, {
  type Node,
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  type Connection,
  type Edge,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  type OnNodesDelete,
  type OnEdgesDelete,
  type ReactFlowInstance,
  type XYPosition,
  ControlButton,
  MarkerType,
  type EdgeTypes,
  type NodeTypes,
  type OnConnect,
} from "reactflow";

import { CustomConnectionLine } from "./ConnectionLine";
import DefaultEdge from "./DefaultEdge";
import { CustomNode } from "./DefaultNode";
import RunNodeComponent from "./RunNode";
import "reactflow/dist/style.css";
import { type RunNode } from "./types";

// Load CustomNode
const DEFAULT_NODE_TYPES: NodeTypes = {
  CustomNode,
};

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

type OnDrop =
  | ((event: DragEvent<HTMLDivElement>, position: XYPosition) => Node)
  | ((event: DragEvent<HTMLDivElement>, position: XYPosition) => Promise<Node>);

type Props =
  | {
      editable: true;
      onNodesDelete: OnNodesDelete;
      onEdgesDelete: OnEdgesDelete;
      onDrop: OnDrop;
      onInit?: OnInit;

      onNodeDoubleClick?: NodeMouseHandler;
      onConnect?: OnConnect;
    }
  | {
      editable: false;
      onInit?: OnInit;
      onNodeDoubleClick?: NodeMouseHandler;
    };
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
    const [rawNodes, setNodes, onNodesChange] = useNodesState([]);
    const [rawEdges, setEdges, onEdgesChange] = useEdgesState([]);

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

    const onNodesDelete = useCallback(
      props.editable ? props.onNodesDelete : () => {},
      [props],
    );

    const onEdgesDelete = useCallback(
      props.editable ? props.onEdgesDelete : () => {},
      [props],
    );

    const onNodeDoubleClick = useCallback<NodeMouseHandler>(
      (e, n) => {
        if (props.onNodeDoubleClick) {
          props.onNodeDoubleClick(e, n);
        }
        if (!props.editable && instance) {
          const nodeCenter = (n.width ?? 0) / 2;
          instance.setCenter(n.position.x + nodeCenter, n.position.y);
        }
      },
      [instance, props],
    );

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    };

    const onDrop = useCallback(
      async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (reactFlowWrapper?.current === null) {
          return;
        }
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        // @ts-expect-error: Unreachable code error
        const position = instance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        if (props.editable) {
          const result = props.onDrop(event, position);
          if (result instanceof Promise) {
            result
              .then((node) => {
                setNodes((ns: Node[]) => ns.concat(node));
              })
              .catch((error) => {
                console.error("Error from Promise-returning function:", error);
              });
          } else {
            const node = result;
            setNodes((ns: Node[]) => ns.concat(node));
          }
        }
      },
      [instance, setNodes, props],
    );

    const onConnect = useCallback(
      (connection: Connection) => {
        setEdges((prevEdges: Edge[]) => addEdge(connection, prevEdges));
        if (props.editable && props.onConnect) {
          props.onConnect(connection);
        }
      },
      [props],
    );

    const autoLayout = useCallback(async () => {
      const elkGraph = {
        id: "root",
        children: rawNodes.map((node) => ({
          id: node.id,
          width: 230,
          height: 140,
        })),
        edges: rawEdges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      const elk = new Elk();

      try {
        const elkLayout = await elk.layout(elkGraph);

        if (elkLayout?.children && elkLayout.edges) {
          const updatedNodes = elkLayout.children.map((elkNode) => {
            const node = rawNodes.find((node) => node.id === elkNode.id);
            if (
              node &&
              elkNode.x !== undefined &&
              elkNode.width !== undefined &&
              elkNode.y !== undefined &&
              elkNode.height !== undefined
            ) {
              return {
                ...node,
                position: {
                  x: elkNode.x - elkNode.width / 2,
                  y: elkNode.y - elkNode.height / 2,
                },
              };
            }
            return node;
          });

          const updatedEdges = elkLayout.edges.map((elkEdge) => ({
            ...rawEdges.find((edge) => edge.id === elkEdge.id),
          }));

          setNodes(updatedNodes as Node[]);
          setEdges(updatedEdges as Edge[]);
          window.requestAnimationFrame(() => instance?.fitView());
        }
      } catch (error) {
        console.error("Error during layout:", error);
      }
    }, [rawNodes, rawEdges]);

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

    useEffect(() => {
      console.log("aqui sempre");
      if (edges && props.editable && props.onConnect) {
        props.onConnect(edges[0] as any);
      }
    }, [edges]);

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
          {props.editable ? (
            <ReactFlow
              nodeTypes={DEFAULT_NODE_TYPES}
              edgeTypes={EDGE_TYPES}
              nodes={nodes}
              edges={edges}
              connectionLineComponent={CustomConnectionLine}
              onInit={onInit}
              deleteKeyCode={["Delete", "Backspace"]}
              onConnect={onConnect}
              onNodeDoubleClick={onNodeDoubleClick}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <Controls
                position="bottom-center"
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <ControlButton onClick={autoLayout} title="auto layout">
                  <AutoFixHighIcon />
                </ControlButton>
              </Controls>
              <Background color={theme.palette.grey[800]} gap={16} />
            </ReactFlow>
          ) : (
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
          )}
        </div>
      </ReactFlowProvider>
    );
  },
);

WorkflowPanel.displayName = "WorkflowPanel";

export { WorkflowPanel };
