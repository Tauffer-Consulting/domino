import React, { useCallback } from "react";
import localForage from "services/config/localForage.config";
import { createCustomContext, getUuid } from "utils";

import { type IWorkflowPieceData } from "./types";

export type ForagePiecesData = Record<string, IWorkflowPieceData>;

export interface IWorkflowPiecesDataContext {
  setForageWorkflowPiecesDataById: (
    id: string,
    pieceData: IWorkflowPieceData,
  ) => Promise<void>;
  setForageWorkflowPiecesData: (pieceData: ForagePiecesData) => Promise<void>;
  fetchForageWorkflowPiecesData: () => Promise<ForagePiecesData>;
  fetchForageWorkflowPiecesDataById: (
    id: string,
  ) => Promise<IWorkflowPieceData | undefined>;
  removeForageWorkflowPieceDataById: (id: string) => Promise<void>;
  clearForageWorkflowPiecesData: () => Promise<void>;
  clearDownstreamDataById: (id: string) => Promise<void>;
}

export const [WorkflowPiecesDataContext, useWorkflowPiecesData] =
  createCustomContext<IWorkflowPiecesDataContext>("WorkflowPiecesData Context");

const WorkflowPiecesDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setForageWorkflowPiecesDataById = useCallback(
    async (id: string, pieceData: IWorkflowPieceData) => {
      let currentData =
        await localForage.getItem<ForagePiecesData>("workflowPiecesData");
      if (!currentData) {
        currentData = {};
      }
      currentData[id] = pieceData;
      await localForage.setItem("workflowPiecesData", currentData);
    },
    [],
  );
  const setForageWorkflowPiecesData = useCallback(
    async (pieceData: ForagePiecesData) => {
      await localForage.setItem("workflowPiecesData", pieceData);
    },
    [],
  );

  const fetchForageWorkflowPiecesData = useCallback(async () => {
    const workflowPiecesData =
      await localForage.getItem<ForagePiecesData>("workflowPiecesData");

    return workflowPiecesData ?? {};
  }, []);

  const fetchForageWorkflowPiecesDataById = useCallback(async (id: string) => {
    const workflowPiecesData =
      await localForage.getItem<ForagePiecesData>("workflowPiecesData");

    if (!workflowPiecesData?.[id]) {
      return;
    }

    return workflowPiecesData[id];
  }, []);

  const clearDownstreamDataById = useCallback(async (id: string) => {
    const hashId = getUuid(id).replaceAll("-", "");
    const workflowPieceData =
      await localForage.getItem<ForagePiecesData>("workflowPiecesData");

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
    await localForage.setItem("workflowPiecesData", workflowPieceData);
  }, []);

  const removeForageWorkflowPieceDataById = useCallback(
    async (id: string) => {
      const workflowPieceData =
        await localForage.getItem<ForagePiecesData>("workflowPiecesData");

      if (!workflowPieceData) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete workflowPieceData[id];
      await localForage.setItem("workflowPiecesData", workflowPieceData);

      await clearDownstreamDataById(id);
    },
    [clearDownstreamDataById],
  );

  const clearForageWorkflowPiecesData = useCallback(async () => {
    await localForage.setItem("workflowPiecesData", {});
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
