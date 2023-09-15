import CustomEdge from "components/CustomEdge";
import CustomNode from "components/CustomNode";
import theme from "providers/theme.config";
import React, {
  type DragEventHandler,
  useCallback,
  useRef,
  type DragEvent,
} from "react";
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

type Props =
  | {
      editable: true;
      onNodesDelete: OnNodesDelete;
      onEdgesDelete: OnEdgesDelete;
      onDrop: DragEventHandler<HTMLDivElement>;
      onInit: OnInit;

      onNodeDoubleClick?: NodeMouseHandler;
    }
  | {
      editable: false;
      onNodeDoubleClick?: NodeMouseHandler;
    };

const WorkflowPanel: React.FC<Props> = (props: Props) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, _setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  const onDrop = useCallback(props.editable ? props.onDrop : () => {}, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((prevEdges: Edge[]) => addEdge(connection, prevEdges));
  }, []);

  return (
    <ReactFlowProvider>
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ height: 600 }}
      >
        <ReactFlow
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          deleteKeyCode={props.editable ? ["Delete", "Backspace"] : []}
          nodes={nodes}
          edges={edges}
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
          <Background color={theme.palette.background.default} gap={16} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowPanel;
