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
} from "react";
import ReactFlow, {
  MiniMap,
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
  type Node,
  type ReactFlowInstance,
  type XYPosition,
  ControlButton,
} from "reactflow";

import DefaultEdge from "./DefaultEdge";
import CustomNode, { type INodeData } from "./DefaultNode";
import "reactflow/dist/style.css";

// Load CustomNode
const NODE_TYPES = {
  CustomNode,
};

const EDGE_TYPES = {
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
  | ((
      event: DragEvent<HTMLDivElement>,
      position: XYPosition,
    ) => Node<INodeData>)
  | ((
      event: DragEvent<HTMLDivElement>,
      position: XYPosition,
    ) => Promise<Node<INodeData>>);

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
  setNodes: React.Dispatch<
    React.SetStateAction<Array<Node<any, string | undefined>>>
  >;
  setEdges: React.Dispatch<React.SetStateAction<Array<Edge<any>>>>;
  autoLayout: () => void;
}
const WorkflowPanel = forwardRef<WorkflowPanelRef, Props>(
  (props: Props, ref: ForwardedRef<WorkflowPanelRef>) => {
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onInit = useCallback(async (instance: ReactFlowInstance) => {
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
    }, []);

    const onNodesDelete = useCallback(
      props.editable ? props.onNodesDelete : () => {},
      [],
    );

    const onEdgesDelete = useCallback(
      props.editable ? props.onEdgesDelete : () => {},
      [],
    );

    const onNodeDoubleClick = useCallback(
      props.editable && props.onNodeDoubleClick
        ? props.onNodeDoubleClick
        : () => {},
      [],
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
        children: nodes.map((node) => ({
          id: node.id,
          width: 230,
          height: 140,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      const elk = new Elk();

      try {
        const elkLayout = await elk.layout(elkGraph);

        console.log(elkLayout);

        if (elkLayout?.children && elkLayout.edges) {
          const updatedNodes = elkLayout.children.map((elkNode) => {
            const node = nodes.find((node) => node.id === elkNode.id);
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
            ...edges.find((edge) => edge.id === elkEdge.id),
            sourcePosition: "right",
            targetPosition: "left",
          }));

          setNodes(updatedNodes as Node[]);
          setEdges(updatedEdges as Edge[]);
          instance?.fitView();
        }
      } catch (error) {
        console.error("Error during layout:", error);
      }
    }, [nodes, edges, instance]);

    useImperativeHandle(
      ref,
      () => {
        return {
          edges,
          nodes,
          setEdges,
          setNodes,
          autoLayout,
        };
      },
      [edges, nodes, setEdges, setNodes],
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
              nodeTypes={NODE_TYPES}
              edgeTypes={EDGE_TYPES}
              nodes={nodes}
              edges={edges}
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
              <MiniMap position="bottom-left" />
              <Controls
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
              nodeTypes={NODE_TYPES}
              edgeTypes={EDGE_TYPES}
              nodes={nodes}
              edges={edges}
              onInit={onInit}
              onNodeDoubleClick={onNodeDoubleClick}
              fitView={true}
              nodesConnectable={false}
            >
              <Controls
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

export default WorkflowPanel;
