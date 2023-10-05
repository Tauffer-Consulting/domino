import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { MenuItem, Select } from "@mui/material";
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
  Panel,
  Position,
} from "reactflow";

import { CustomConnectionLine } from "./ConnectionLine";
import DefaultEdge from "./DefaultEdge";
import { CustomNode } from "./DefaultNode";
import RunNodeComponent from "./RunNode";

import "reactflow/dist/style.css";

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

export type WorkflowOrientation = "horizontal" | "vertical";

type Props =
  | {
      editable: true;
      onNodesDelete: OnNodesDelete;
      onEdgesDelete: OnEdgesDelete;
      onDrop: OnDrop;
      onInit?: OnInit;

      onNodeDoubleClick?: NodeMouseHandler;
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
  orientation: WorkflowOrientation;
}
const WorkflowPanel = forwardRef<WorkflowPanelRef, Props>(
  (props: Props, ref: ForwardedRef<WorkflowPanelRef>) => {
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
    const [rawNodes, setNodes, onNodesChange] = useNodesState([]);
    const [rawEdges, setEdges, onEdgesChange] = useEdgesState([]);
    const [orientation, setOrientation] =
      useState<WorkflowOrientation>("vertical");

    const onInit = useCallback(async (instance: ReactFlowInstance) => {
      setInstance(instance);
      if (props.onInit) {
        const result = props.onInit(instance);
        if (result instanceof Promise) {
          result
            .then(({ nodes, edges }) => {
              if (nodes.length && nodes[0].data.orientation) {
                setOrientation(nodes[0].data.orientation);
              }
              setNodes(nodes);
              setEdges(edges);
            })
            .catch((error) => {
              console.error("Error from Promise-returning function:", error);
            });
        } else {
          const { nodes, edges } = result;
          if (nodes.length && nodes[0].data.orientation) {
            setOrientation(nodes[0].data.orientation);
          }
          setNodes(nodes);
          setEdges(edges);
        }
      }
      window.requestAnimationFrame(() => instance.fitView());
    }, []);

    const onNodesDelete = useCallback(
      props.editable ? props.onNodesDelete : () => {},
      [],
    );

    const onEdgesDelete = useCallback(
      props.editable ? props.onEdgesDelete : () => {},
      [],
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
      [instance],
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
      [instance, setNodes],
    );

    const onConnect = useCallback((connection: Connection) => {
      setEdges((prevEdges: Edge[]) => addEdge(connection, prevEdges));
    }, []);

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
        const elkLayout = await elk.layout(elkGraph, {
          layoutOptions: {
            "org.eclipse.elk.direction":
              orientation === "horizontal" ? "RIGHT" : "DOWN",
          },
        });

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
                targetPosition: orientation === "horizontal" ? "left" : "top",
                sourcePosition:
                  orientation === "horizontal" ? "right" : "bottom",
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
    }, [rawNodes, rawEdges, orientation]);

    const { nodes, edges } = useMemo(() => {
      const sourcePosition =
        orientation === "horizontal" ? Position.Right : Position.Bottom;
      const targetPosition =
        orientation === "horizontal" ? Position.Left : Position.Top;

      const nodes = [...rawNodes].map((node: Node) => ({
        ...node,
        targetPosition,
        sourcePosition,
        data: {
          ...node.data,
          orientation,
        },
      }));
      const edges = [...rawEdges].map((edge: Edge) => ({
        ...edge,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      }));

      return {
        nodes,
        edges,
      };
    }, [rawNodes, rawEdges, orientation]);

    useImperativeHandle(
      ref,
      () => {
        return {
          edges: rawEdges,
          nodes: rawNodes,
          setEdges,
          setNodes,
          orientation,
        };
      },
      [rawEdges, rawNodes, setEdges, setNodes, orientation, setOrientation],
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
              <Panel position="top-right">
                <Select
                  value={orientation}
                  onChange={(e) => {
                    setOrientation(e.target.value as any);
                  }}
                >
                  <MenuItem value={"horizontal"}>horizontal</MenuItem>
                  <MenuItem value={"vertical"}>vertical</MenuItem>
                </Select>
              </Panel>
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
              nodes={rawNodes}
              edges={rawEdges}
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
