import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { Paper } from "@mui/material";
import { usesPieces } from "context/workspaces";
import Elk from "elkjs";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import {
  storageAccessModes,
  type WorkflowPieceData,
} from "features/workflowEditor/context/types";
import theme from "providers/theme.config";
import React, {
  useCallback,
  type DragEvent,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import ReactFlow, {
  type Node,
  addEdge,
  Background,
  Controls,
  type Connection,
  type Edge,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
  type ReactFlowInstance,
  type XYPosition,
  ControlButton,
  MarkerType,
  type EdgeTypes,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import {
  extractDefaultContainerResources,
  extractDefaultInputValues,
  isDag,
} from "../../../utils";

import { CustomConnectionLine } from "./ConnectionLine";
import DefaultEdge from "./DefaultEdge";
import { CustomNode } from "./DefaultNode";
import { type DefaultNode } from "./types";

const getId = (module_name: string) => {
  return `${module_name}_${uuidv4()}`;
};

const DEFAULT_NODE_TYPES: NodeTypes = {
  CustomNode,
};

const EDGE_TYPES: EdgeTypes = {
  default: DefaultEdge,
};

interface Props {
  onNodeDoubleClick: NodeMouseHandler;
}

export interface WorkflowPanelRef {
  edges: Edge[];
  nodes: DefaultNode[];
  setNodes: React.Dispatch<React.SetStateAction<DefaultNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const WorkflowPanel = forwardRef<WorkflowPanelRef, Props>(
  ({ onNodeDoubleClick }, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
    const [rawNodes, setNodes, onNodesChange] = useNodesState([]);
    const [rawEdges, setEdges, onEdgesChange] = useEdgesState([]);

    const {
      getWorkflowNodes,
      getWorkflowEdges,
      setWorkflowPieces,
      getWorkflowPieces,
      deleteWorkflowPieceById,
      deleteWorkflowPieceDataById,
      setWorkflowPieceDataById,
      clearDownstreamDataById,
      setWorkflowEdges,
      setWorkflowNodes,
    } = useWorkflowsEditor();

    const { fetchForagePieceById } = usesPieces();

    const onInit = useCallback(
      (instance: ReactFlowInstance) => {
        setInstance(instance);
        const edges = getWorkflowEdges();
        const nodes = getWorkflowNodes();
        setNodes(nodes);
        setEdges(edges);
        window.requestAnimationFrame(() => instance.fitView());
      },
      [getWorkflowEdges, getWorkflowNodes, setNodes, setEdges],
    );

    const createNewNode = useCallback(
      (event: DragEvent<HTMLDivElement>, position: XYPosition) => {
        event.preventDefault();
        const nodeData = event.dataTransfer.getData("application/reactflow");
        const { ...data } = JSON.parse(nodeData);

        const newNodeData: DefaultNode["data"] = {
          name: data.name,
          style: data.style,
          validationError: false,
          orientation: data?.orientation ?? "horizontal",
        };

        const newNode = {
          id: getId(data.id),
          type: "CustomNode",
          position,
          data: newNodeData,
        };

        const piece = fetchForagePieceById(data.id) as unknown as Piece;
        const defaultInputs = extractDefaultInputValues(piece);

        const defaultContainerResources = extractDefaultContainerResources(
          piece?.container_resources,
        );

        const currentWorkflowPieces = getWorkflowPieces();
        const newWorkflowPieces = {
          ...currentWorkflowPieces,
          [newNode.id]: piece,
        };
        setWorkflowPieces(newWorkflowPieces);

        const defaultWorkflowPieceData: WorkflowPieceData = {
          storage: { storageAccessMode: storageAccessModes.ReadWrite },
          containerResources: defaultContainerResources,
          inputs: defaultInputs,
        };

        setWorkflowPieceDataById(newNode.id, defaultWorkflowPieceData);
        return newNode;
      },
      [
        fetchForagePieceById,
        setWorkflowPieces,
        getWorkflowPieces,
        setWorkflowPieceDataById,
      ],
    );

    const onDrop = useCallback(
      async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (reactFlowWrapper?.current === null || instance === null) {
          return;
        }
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();

        const position = instance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = createNewNode(event, position);
        if (newNode) {
          setNodes((ns: Node[]) => {
            const nodes = ns.concat(newNode);
            setWorkflowNodes(nodes);
            return nodes;
          });
        }
      },
      [instance, setNodes, createNewNode],
    );

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    };

    const onConnect = useCallback(
      (connection: Connection) => {
        const newEdge: any = {
          ...connection,
          id: `${Math.random()}`,
        };
        const newEdges = [...edges, newEdge];
        if (!isDag(nodes, newEdges)) {
          toast.error("Workflow must be acyclic!");
          return;
        }
        setEdges((prevEdges: Edge[]) => {
          const edges = addEdge(connection, prevEdges);
          setWorkflowEdges(edges);
          return edges;
        });
      },
      [rawEdges, rawNodes],
    );

    const onNodesDelete = useCallback(
      (nodes: any) => {
        for (const node of nodes) {
          deleteWorkflowPieceById(node.id);
          deleteWorkflowPieceDataById(node.id);
        }
      },
      [deleteWorkflowPieceDataById, deleteWorkflowPieceById],
    );

    const onEdgesDelete = useCallback(
      (edges: Edge[]) => {
        for (const edge of edges) {
          clearDownstreamDataById(edge.source);
          // TODO remover a edge no localStorage
        }
      },
      [clearDownstreamDataById],
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
        return {
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
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
          edges,
          nodes,
          setEdges,
          setNodes,
        };
      },
      [rawEdges, rawNodes, setEdges, setNodes],
    );

    return (
      <Paper ref={reactFlowWrapper} sx={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodeTypes={DEFAULT_NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          nodes={nodes}
          edges={edges}
          connectionLineComponent={CustomConnectionLine}
          fitView={true}
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
      </Paper>
    );
  },
);

WorkflowPanel.displayName = "WorkflowPanel";

export { WorkflowPanel };
