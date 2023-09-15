import CustomEdge from "components/CustomEdge";
import CustomNode, { type INodeData } from "components/CustomNode";
import theme from "providers/theme.config";
import React, { useCallback, type DragEvent, useState, useRef } from "react";
import ReactFlow, {
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
} from "reactflow";

// Load CustomNode
const NODE_TYPES = {
  CustomNode,
};

const EDGE_TYPES = {
  CustomEdge,
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
      onInit: OnInit;

      onNodeDoubleClick?: NodeMouseHandler;
    }
  | {
      editable: false;
      onInit: OnInit;
      onNodeDoubleClick?: NodeMouseHandler;
    };

const WorkflowPanel: React.FC<Props> = (props: Props) => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onInit = useCallback(async (instance: ReactFlowInstance) => {
    setInstance(instance);
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
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
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

  return (
    <ReactFlowProvider>
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ height: "100%", width: "100%" }}
      >
        <ReactFlow
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          nodes={nodes}
          edges={edges}
          onInit={onInit}
          deleteKeyCode={props.editable ? ["Delete", "Backspace"] : []}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Controls />
          <Background color={theme.palette.grey[800]} gap={16} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowPanel;
