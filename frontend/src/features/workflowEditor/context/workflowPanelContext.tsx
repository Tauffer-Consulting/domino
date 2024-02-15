import { useStorage } from "context/storage/useStorage";
import React, { useCallback } from "react";
import { type Node, type Edge } from "reactflow";
import { createCustomContext, getUuid } from "utils";

import { type DefaultNode } from "../components/Panel/WorkflowPanel";

import { type WorkflowPieceData } from "./types";

export type StoragePiecesData = Record<string, WorkflowPieceData>;

export interface IWorkflowPanelContext {
  setWorkflowEdges: (edges: Edge[]) => void;
  setWorkflowNodes: (edges: Node[]) => void;
  getWorkflowEdges: () => Edge[];
  getWorkflowNodes: () => DefaultNode[];

  setWorkflowPieces: (pieces: Record<string, Piece>) => void;
  setWorkflowPieceOutputSchema: (id: string, properties: Properties) => void;
  getWorkflowPieces: () => Record<string, Piece>;
  getWorkflowPieceById: (id: string) => Piece | null;
  deleteWorkflowPieceById: (id: string) => void;

  setWorkflowPiecesData: (pieceData: StoragePiecesData) => void;
  setWorkflowPieceDataById: (id: string, pieceData: WorkflowPieceData) => void;
  getWorkflowPiecesData: () => StoragePiecesData;
  getWorkflowPieceDataById: (id: string) => WorkflowPieceData | null;
  deleteWorkflowPieceDataById: (id: string) => void;

  clearWorkflowPanelContext: () => void;
  clearDownstreamDataById: (id: string) => void;
}

export const [WorkflowPanelContext, useWorkflowPanel] =
  createCustomContext<IWorkflowPanelContext>("WorkflowPanelContext Context");

const WorkflowPanelContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const localStorage = useStorage();

  const setWorkflowEdges = useCallback((edges: Edge[]) => {
    localStorage.setItem("workflowEdges", edges);
  }, []);
  const setWorkflowNodes = useCallback((nodes: DefaultNode[]) => {
    localStorage.setItem("workflowNodes", nodes);
  }, []);
  const getWorkflowEdges = useCallback(() => {
    return localStorage.getItem<Edge[]>("workflowEdges") ?? [];
  }, []);
  const getWorkflowNodes = useCallback(() => {
    return localStorage.getItem<DefaultNode[]>("workflowNodes") ?? [];
  }, []);

  const setWorkflowPieces = useCallback((pieces: Record<string, Piece>) => {
    localStorage.setItem("workflowPieces", pieces);
  }, []);
  const setWorkflowPieceOutputSchema = useCallback(
    (id: string, properties: Properties) => {
      const workflowPieces =
        localStorage.getItem<Record<string, Piece>>("workflowPieces");
      if (workflowPieces?.[id]) {
        workflowPieces[id].output_schema.properties = properties;
        localStorage.setItem("workflowPieces", workflowPieces);
      }
    },
    [],
  );
  const getWorkflowPieces = useCallback(() => {
    return localStorage.getItem<Record<string, Piece>>("workflowPieces") ?? {};
  }, []);
  const getWorkflowPieceById = useCallback((id: string) => {
    return (
      localStorage.getItem<Record<string, Piece>>("workflowPieces")?.[id] ??
      null
    );
  }, []);
  const deleteWorkflowPieceById = useCallback((id: string) => {
    const workflowPieces =
      localStorage.getItem<Record<string, Piece>>("workflowPieces");
    if (!workflowPieces) {
      return;
    }
    delete workflowPieces?.[id];
    localStorage.setItem("workflowPieces", workflowPieces);
  }, []);

  const setWorkflowPiecesData = useCallback((data: StoragePiecesData) => {
    localStorage.setItem("workflowPiecesData", data);
  }, []);
  const setWorkflowPieceDataById = useCallback(
    (id: string, pieceData: WorkflowPieceData) => {
      let currentData =
        localStorage.getItem<StoragePiecesData>("workflowPiecesData");
      if (!currentData) {
        currentData = {};
      }
      currentData[id] = pieceData;
      localStorage.setItem("workflowPiecesData", currentData);
    },
    [],
  );
  const getWorkflowPiecesData = useCallback(() => {
    return localStorage.getItem<StoragePiecesData>("workflowPiecesData") ?? {};
  }, []);
  const getWorkflowPieceDataById = useCallback((id: string) => {
    return (
      localStorage.getItem<StoragePiecesData>("workflowPiecesData")?.[id] ??
      null
    );
  }, []);
  const deleteWorkflowPieceDataById = useCallback((id: string) => {
    const piecesData =
      localStorage.getItem<StoragePiecesData>("workflowPiecesData") ??
      ({} satisfies StoragePiecesData);

    delete piecesData?.[id];

    localStorage.setItem("workflowPiecesData", piecesData);
  }, []);
  const clearDownstreamDataById = useCallback((id: string) => {
    const hashId = getUuid(id).replaceAll("-", "");
    const workflowPieceData =
      localStorage.getItem<StoragePiecesData>("workflowPiecesData");

    if (!workflowPieceData) {
      return;
    }

    Object.values(workflowPieceData).forEach((wpd) => {
      Object.values(wpd.inputs).forEach((input) => {
        if (input.upstreamId.includes(hashId)) {
          input.upstreamArgument = "";
          input.upstreamId = "";
          input.upstreamValue = "";
        } else if (Array.isArray(input.value)) {
          input.value.forEach((item) => {
            if (
              typeof item.upstreamId === "string" &&
              item.upstreamId.includes(hashId)
            ) {
              item.upstreamArgument = "";
              item.upstreamId = "";
              item.upstreamValue = "";
            } else if (typeof item.upstreamId === "object") {
              Object.keys(item.upstreamId).forEach((key) => {
                const obj = item as any;
                if (obj.upstreamId[key].includes(hashId)) {
                  obj.upstreamArgument[key] = "";
                  obj.upstreamId[key] = "";
                  obj.upstreamValue[key] = "";
                }
              });
            }
          });
        }
      });
    });
    localStorage.setItem("workflowPiecesData", workflowPieceData);
  }, []);

  const clearWorkflowPanelContext = useCallback(() => {
    localStorage.removeItem("workflowEdges");
    localStorage.removeItem("workflowNodes");
    localStorage.removeItem("workflowPieces");
    localStorage.removeItem("workflowPiecesData");
  }, []);

  const value: IWorkflowPanelContext = {
    setWorkflowEdges,
    setWorkflowNodes,
    getWorkflowEdges,
    getWorkflowNodes,

    setWorkflowPieces,
    setWorkflowPieceOutputSchema,
    getWorkflowPieces,
    getWorkflowPieceById,
    deleteWorkflowPieceById,

    setWorkflowPiecesData,
    setWorkflowPieceDataById,
    getWorkflowPiecesData,
    getWorkflowPieceDataById,
    deleteWorkflowPieceDataById,
    clearDownstreamDataById,

    clearWorkflowPanelContext,
  };

  return (
    <WorkflowPanelContext.Provider value={value}>
      {children}
    </WorkflowPanelContext.Provider>
  );
};

export default WorkflowPanelContextProvider;
