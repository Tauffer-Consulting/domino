import { type INodeData } from "components/CustomNode";
import WorkflowPanel from "components/ReactFlow";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import {
  type IWorkflowPieceData,
  storageAccessModes,
} from "features/workflowEditor/context/types";
import { containerResourcesSchema } from "features/workflowEditor/schemas/containerResourcesSchemas";
import {
  extractDefaultInputValues,
  extractDefaultValues,
} from "features/workflowEditor/utils";
import React, { type DragEvent, useCallback, useEffect, useState } from "react";
import { type XYPosition, type Edge } from "reactflow";
import { v4 as uuidv4 } from "uuid";

import SidebarForm from "../SidebarForm";
/**
 * @todo When change the workspace should we clear the forage ?
 * @todo Solve any types
 */

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

  const {
    nodeDirection,
    setEdges,
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

      return { nodes: workflowNodes, edges: workflowEdges };
    },
    [setNodes, setEdges, fetchForageWorkflowNodes, fetchForageWorkflowEdges],
  );

  const onDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>, position: XYPosition) => {
      event.preventDefault();
      const nodeData = event.dataTransfer.getData("application/reactflow");
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

      const piece = await fetchForagePieceById(data.id);
      const defaultInputs = extractDefaultInputValues(
        piece as unknown as Piece,
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
      return newNode;
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
    <>
      <div style={{ height: 750 }}>
        <WorkflowPanel
          editable={true}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onInit={onLoad}
          onDrop={onDrop}
        />
      </div>

      <SidebarForm
        schema={formSchema}
        formId={formId}
        onClose={toggleDrawer(false)}
        open={drawerState}
        title={formTitle}
      />
    </>
  );
};

export default WorkflowEditorPanelComponent;
