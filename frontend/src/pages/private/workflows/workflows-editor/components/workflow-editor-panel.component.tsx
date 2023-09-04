import { containerResourcesSchema } from "common/schemas/containerResourcesSchemas";
import {
  type IWorkflowPieceData,
  storageAccessModes,
} from "context/workflows/types";
import { useWorkflowsEditor } from "context/workflows/workflows-editor.context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Edge,
  MarkerType,
  // removeElements,
  type Node,
} from "reactflow";
import { extractDefaultValues, extractDefaultInputValues } from "utils";
import { v4 as uuidv4 } from "uuid";

import CustomNode from "./custom-node.component";
import { type INodeData } from "./custom-node.component";
import SidebarForm from "./sidebar-form.component";
/**
 * @todo When change the workspace should we clear the forage ?
 * @todo Solve any types
 */

// Load CustomNode
const nodeTypes = {
  CustomNode,
};

// @ts-expect-error: Unreachable code error
const getId = (module_name) => {
  return `${module_name}_${uuidv4()}`;
};

interface Props {
  nodesWithErros: string[];
}

const WorkflowEditorPanelComponent = ({ nodesWithErros }: Props) => {
  const [formSchema, setFormSchema] = useState<any>({});
  const [formId, setFormId] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [drawerState, setDrawerState] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);

  const {
    nodeDirection,
    edges,
    setEdges,
    nodes,
    setNodes,
    fetchForagePieceById,
    fetchForageWorkflowNodes,
    fetchForageWorkflowEdges,
    setForageWorkflowPieces,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    removeForageWorkflowPieceDataById,
    fetchWorkflowPieceById,
    setForageWorkflowPiecesData,
    clearDownstreamDataById,
  } = useWorkflowsEditor();

  // Removing flowchart elements
  const onNodesDelete = useCallback(
    async (nodes: any) => {
      for (const node of nodes) {
        await removeForageWorkflowPiecesById(node.id);
        await removeForageWorkflowPieceDataById(node.id);
      }
    },
    [removeForageWorkflowPieceDataById, removeForageWorkflowPiecesById],
  );

  const onEdgesDelete = useCallback(
    async (edges: Edge[]) => {
      for (const edge of edges) {
        await clearDownstreamDataById(edge.source);
      }
    },
    [clearDownstreamDataById],
  );

  // Node double click open drawer with forms
  const onNodeDoubleClick = useCallback(
    async (event: any, node: any) => {
      const pieceNode = await fetchWorkflowPieceById(node.id);
      setFormSchema(pieceNode?.input_schema);
      setFormId(node.id);
      setFormTitle(() => {
        return pieceNode?.name ? pieceNode?.name : "";
      });
      setDrawerState(true);
    },
    [fetchWorkflowPieceById],
  );

  const onLoad = useCallback(
    async (_reactFlowInstance: any) => {
      setReactFlowInstance(_reactFlowInstance);
      // // Fetch old state from forage to avoid loosing flowchart when refreshing/leaving page
      const workflowNodes = await fetchForageWorkflowNodes();
      const workflowEdges = await fetchForageWorkflowEdges();

      if (workflowNodes.length > 0) {
        setNodes(workflowNodes);
      }
      if (workflowEdges.length > 0) {
        setEdges(workflowEdges);
      }
    },
    [setNodes, setEdges, fetchForageWorkflowNodes, fetchForageWorkflowEdges],
  );

  // Drag and Drop functions
  // @ts-expect-error: Unreachable code error
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = useCallback(
    async (event: any) => {
      event.preventDefault();

      // @ts-expect-error: Unreachable code error
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeData = event.dataTransfer.getData("application/reactflow");
      // @ts-expect-error: Unreachable code error
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const { ...data } = JSON.parse(nodeData);

      const newNodeData: INodeData = {
        name: data.name,
        style: data.style,
        handleOriantation: nodeDirection,
        error: false,
      };

      const newNode = {
        id: getId(data.id),
        type: "CustomNode",
        position,
        data: newNodeData,
      };

      setNodes((ns: Node[]) => ns.concat(newNode));
      const piece = await fetchForagePieceById(data.id);
      const defaultInputs = extractDefaultInputValues(
        piece as unknown as PieceSchema,
      );
      const defaultContainerResources = extractDefaultValues(
        containerResourcesSchema as any,
      );

      const currentWorkflowPieces = await getForageWorkflowPieces();
      const newWorkflowPieces = {
        ...currentWorkflowPieces,
        [newNode.id]: piece,
      };
      await setForageWorkflowPieces(newWorkflowPieces);

      const defaultWorkflowPieceData: IWorkflowPieceData = {
        storage: { storageAccessMode: storageAccessModes.ReadWrite },
        containerResources: defaultContainerResources,
        inputs: defaultInputs,
      };

      await setForageWorkflowPiecesData(newNode.id, defaultWorkflowPieceData);
    },
    [
      fetchForagePieceById,
      nodeDirection,
      reactFlowInstance,
      setNodes,
      setForageWorkflowPieces,
      getForageWorkflowPieces,
      setForageWorkflowPiecesData,
    ],
  );

  // Left drawer controls
  // @ts-expect-error: Unreachable code error
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerState(open);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds: Node[]) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds));
    },
    [setEdges],
  );

  // Connecting elements
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((prevEdges: Edge[]) => {
        const newEdges = addEdge(connection, prevEdges);
        newEdges.forEach((edge: Edge) => {
          edge.markerEnd = {
            type: MarkerType.ArrowClosed,
            width: 30,
            height: 30,
            color: "#6a6a6e",
          };
          edge.animated = false;
        });

        return newEdges;
      });
    },
    [setEdges],
  );

  const setNodeErrors = useCallback(
    (nodeIds: string[]) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (nodeIds.includes(n.id)) {
            n = {
              ...n,
              data: {
                ...n.data,
                error: true,
              },
            };
          } else {
            n = {
              ...n,
              data: {
                ...n.data,
                error: false,
              },
            };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  useEffect(() => {
    setNodeErrors(nodesWithErros);
  }, [nodesWithErros, setNodeErrors]);

  return (
    <ReactFlowProvider>
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ height: 600 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          deleteKeyCode={["Delete", "Backspace"]} /* 'delete'-key */
          onInit={onLoad}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
      <SidebarForm
        schema={formSchema}
        formId={formId}
        onClose={toggleDrawer(false)}
        open={drawerState}
        title={formTitle}
      />
    </ReactFlowProvider>
  );
};

export default WorkflowEditorPanelComponent;
