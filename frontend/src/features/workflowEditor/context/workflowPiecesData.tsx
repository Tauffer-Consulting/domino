import { useStorage } from "@nathan-vm/use-storage";
import React, { useCallback } from "react";
import { createCustomContext, getUuid } from "utils";

import { type IWorkflowPieceData } from "./types";

export type ForagePiecesData = Record<string, IWorkflowPieceData>;

export interface IWorkflowPiecesDataContext {
  setForageWorkflowPiecesDataById: (
    id: string,
    pieceData: IWorkflowPieceData,
  ) => void;
  setForageWorkflowPiecesData: (pieceData: ForagePiecesData) => void;
  fetchForageWorkflowPiecesData: () => ForagePiecesData;
  fetchForageWorkflowPiecesDataById: (
    id: string,
  ) => IWorkflowPieceData | undefined;
  removeForageWorkflowPieceDataById: (id: string) => void;
  clearForageWorkflowPiecesData: () => void;
  clearDownstreamDataById: (id: string) => void;
}

export const [WorkflowPiecesDataContext, useWorkflowPiecesData] =
  createCustomContext<IWorkflowPiecesDataContext>("WorkflowPiecesData Context");

const WorkflowPiecesDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const localStorage = useStorage();

  const setForageWorkflowPiecesDataById = useCallback(
    (id: string, pieceData: IWorkflowPieceData) => {
      let currentData =
        localStorage.getItem<ForagePiecesData>("workflowPiecesData");
      if (!currentData) {
        currentData = {};
      }
      currentData[id] = pieceData;
      localStorage.setItem("workflowPiecesData", currentData);
    },
    [],
  );
  const setForageWorkflowPiecesData = useCallback(
    (pieceData: ForagePiecesData) => {
      localStorage.setItem("workflowPiecesData", pieceData);
    },
    [],
  );

  const fetchForageWorkflowPiecesData = useCallback(() => {
    const workflowPiecesData =
      localStorage.getItem<ForagePiecesData>("workflowPiecesData");

    return workflowPiecesData ?? {};
  }, []);

  const fetchForageWorkflowPiecesDataById = useCallback((id: string) => {
    const workflowPiecesData =
      localStorage.getItem<ForagePiecesData>("workflowPiecesData");

    if (!workflowPiecesData?.[id]) {
      return;
    }

    return workflowPiecesData[id];
  }, []);

  const clearDownstreamDataById = useCallback((id: string) => {
    const hashId = getUuid(id).replaceAll("-", "");
    const workflowPieceData =
      localStorage.getItem<ForagePiecesData>("workflowPiecesData");

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

  const removeForageWorkflowPieceDataById = useCallback(
    (id: string) => {
      const workflowPieceData =
        localStorage.getItem<ForagePiecesData>("workflowPiecesData");

      if (!workflowPieceData) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete workflowPieceData[id];
      localStorage.setItem("workflowPiecesData", workflowPieceData);

      clearDownstreamDataById(id);
    },
    [clearDownstreamDataById],
  );

  const clearForageWorkflowPiecesData = useCallback(() => {
    localStorage.setItem("workflowPiecesData", {});
  }, []);

  const value: IWorkflowPiecesDataContext = {
    setForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    removeForageWorkflowPieceDataById,
    clearForageWorkflowPiecesData,
    clearDownstreamDataById,
  };

  return (
    <WorkflowPiecesDataContext.Provider value={value}>
      {children}
    </WorkflowPiecesDataContext.Provider>
  );
};

export default WorkflowPiecesDataProvider;
