import { useWorkspaces } from "context/workspaces";
import {
  type IPostWorkflowParams,
  useAuthenticatedPostWorkflow,
} from "features/workflows/api";
import {
  type IWorkflowElement,
  type IPostWorkflowResponseInterface,
} from "features/workflows/types";
import React, { type FC, useCallback } from "react";
import { type Edge } from "reactflow";
import { createCustomContext, generateTaskName, getIdSlice } from "utils";

import { usesPieces, type IPiecesContext } from "./pieces";
import {
  useReactWorkflowPersistence,
  type IReactWorkflowPersistenceContext,
} from "./reactWorkflowPersistence";
import {
  type IWorkflowSettings,
  type CreateWorkflowRequest,
  type TasksDataModel,
} from "./types";
import { useWorkflowPiece, type IWorkflowPieceContext } from "./workflowPieces";
import {
  useWorkflowPiecesData,
  type IWorkflowPiecesDataContext,
  type ForagePiecesData,
} from "./workflowPiecesData";
import {
  type IWorkflowSettingsContext,
  useWorkflowSettings,
} from "./workflowSettingsData";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type GenerateWorkflowsParams = {
  workflowPiecesData: ForagePiecesData;
  workflowSettingsData: IWorkflowSettings;
  workflowNodes: IWorkflowElement[];
  workflowEdges: Edge[];
};

export type DominoWorkflowForage = GenerateWorkflowsParams & {
  workflowPieces: Record<string, Piece>;
};

interface IWorkflowsEditorContext
  extends IPiecesContext,
    IReactWorkflowPersistenceContext,
    IWorkflowSettingsContext,
    IWorkflowPieceContext,
    IWorkflowPiecesDataContext {
  fetchWorkflowForage: () => Promise<DominoWorkflowForage>;
  importWorkflowToForage: (
    importedWorkflow: DominoWorkflowForage,
  ) => Promise<void>;
  generateWorkflowsEditorBodyParams: (
    p: GenerateWorkflowsParams,
  ) => Promise<CreateWorkflowRequest>;
  handleCreateWorkflow: (
    params: IPostWorkflowParams,
  ) => Promise<IPostWorkflowResponseInterface>;
  clearForageData: () => Promise<void>;
}

export const [WorkflowsEditorContext, useWorkflowsEditor] =
  createCustomContext<IWorkflowsEditorContext>("WorkflowsEditor Context");

const WorkflowsEditorProvider: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { workspace } = useWorkspaces();
  const postWorkflow = useAuthenticatedPostWorkflow();

  const {
    repositories,
    repositoriesError,
    repositoriesLoading,
    repositoryPieces,
    fetchForagePieceById,
    fetchRepoById,
    search,
    handleSearch,
  } = usesPieces();

  const {
    setWorkflowEdges,
    setWorkflowNodes,
    fetchForageWorkflowEdges,
    fetchForageWorkflowNodes,
    clearReactWorkflowPersistence,
  } = useReactWorkflowPersistence();

  const {
    setForageWorkflowPieces,
    setForageWorkflowPiecesOutputSchema,
    fetchWorkflowPieceById,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    clearForageWorkflowPieces,
  } = useWorkflowPiece();

  const {
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,
    setForageWorkflowPiecesDataById,
    clearForageWorkflowPiecesData,
    removeForageWorkflowPieceDataById,
    clearDownstreamDataById,
  } = useWorkflowPiecesData();

  const {
    fetchWorkflowSettingsData,
    setWorkflowSettingsData,
    clearWorkflowSettingsData,
  } = useWorkflowSettings();

  const handleCreateWorkflow = useCallback(
    async (payload: IPostWorkflowParams) => {
      return await postWorkflow({
        ...payload,
        workspace_id: workspace?.id ?? "",
      });
    },
    [postWorkflow, workspace],
  );

  const fetchWorkflowForage = useCallback(async () => {
    const workflowPieces = await getForageWorkflowPieces();
    const workflowPiecesData = await fetchForageWorkflowPiecesData();
    const workflowSettingsData = await fetchWorkflowSettingsData();
    const workflowNodes = await fetchForageWorkflowNodes();
    const workflowEdges = await fetchForageWorkflowEdges();
    const result: DominoWorkflowForage = {
      workflowPieces,
      workflowPiecesData,
      workflowSettingsData,
      workflowNodes,
      workflowEdges,
    };
    return result;
  }, [
    fetchForageWorkflowPiecesData,
    fetchWorkflowSettingsData,
    getForageWorkflowPieces,
  ]);

  const importWorkflowToForage = useCallback(
    async (dominoWorkflow: DominoWorkflowForage) => {
      await setForageWorkflowPieces(dominoWorkflow.workflowPieces);
      await setForageWorkflowPiecesData(dominoWorkflow.workflowPiecesData);
      await setWorkflowSettingsData(dominoWorkflow.workflowSettingsData);
      await setWorkflowNodes(dominoWorkflow.workflowNodes);
      await setWorkflowEdges(dominoWorkflow.workflowEdges);
    },
    [
      setForageWorkflowPieces,
      setForageWorkflowPiecesData,
      setWorkflowSettingsData,
      setWorkflowNodes,
      setWorkflowEdges,
    ],
  );

  const generateWorkflowsEditorBodyParams = useCallback(
    async ({
      workflowPieces,
      workflowPiecesData,
      workflowSettingsData,
      workflowNodes,
      workflowEdges,
    }: GenerateWorkflowsParams) => {
      const workflow: CreateWorkflowRequest["workflow"] = {
        name: workflowSettingsData.config.name,
        schedule: workflowSettingsData.config.scheduleInterval,
        select_end_date: workflowSettingsData.config.endDateType,
        start_date: workflowSettingsData.config.startDate,
        end_date: workflowSettingsData.config.endDate,
      };

      const ui_schema: CreateWorkflowRequest["ui_schema"] = {
        nodes: {},
        edges: workflowEdges,
      };

      const tasks: CreateWorkflowRequest["tasks"] = {};

      for (const element of workflowNodes) {
        const elementData = workflowPiecesData[element.id];
        const pieceData = workflowPieces[element.id];

        const taskName = generateTaskName(element.data.name, element.id);

        ui_schema.nodes[taskName] = element;

        const dependencies = workflowEdges.reduce<string[]>(
          (acc: string[], edge: { target: any; source: any }) => {
            if (edge.target === element.id) {
              const task = workflowNodes.find(
                (n: { id: any }) => n.id === edge.source,
              );
              if (task) {
                const upTaskName = generateTaskName(task.data.name, task.id);
                acc.push(upTaskName);
              }
            }

            return acc;
          },
          [],
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { storageSource, baseFolder, ...providerOptions } =
          workflowSettingsData.storage || {};

        const workflowSharedStorage = {
          source: storageSource,
          ...{ mode: elementData?.storage?.storageAccessMode },
          provider_options: {
            ...(providerOptions && providerOptions.bucket !== ""
              ? { bucket: providerOptions.bucket, base_folder: baseFolder }
              : {}),
          },
        };

        const pieceInputKwargs = Object.entries(elementData.inputs).reduce<
          Record<string, any>
        >((acc, [key, value]) => {
          if (Array.isArray(value.value)) {
            acc[key] = {
              fromUpstream: value.fromUpstream,
              upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
              upstreamArgument: value.fromUpstream
                ? value.upstreamArgument
                : null,
              value: value.value.map((value) => {
                return {
                  fromUpstream: value.fromUpstream,
                  upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
                  upstreamArgument: value.fromUpstream
                    ? value.upstreamArgument
                    : null,
                  value: value.value,
                };
              }),
            };

            return acc;
          }

          acc[key] = {
            fromUpstream: value.fromUpstream,
            upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
            upstreamArgument: value.fromUpstream
              ? value.upstreamArgument
              : null,
            value: value.value,
          };

          return acc;
        }, {});

        const taskDataModel: TasksDataModel = {
          task_id: taskName,
          piece: {
            name: element.data.name,
            source_image: pieceData.source_image,
          },
          dependencies,
          piece_input_kwargs: pieceInputKwargs,
          workflow_shared_storage: workflowSharedStorage,
          container_resources: {
            requests: {
              cpu: elementData.containerResources.cpu.min,
              memory: elementData.containerResources.memory.min,
            },
            limits: {
              cpu: elementData.containerResources.cpu.max,
              memory: elementData.containerResources.memory.max,
            },
            use_gpu: elementData.containerResources.useGpu,
          },
        };

        tasks[taskName] = taskDataModel;
      }

      return {
        workflow,
        tasks,
        ui_schema,
      };
    },
    [
      fetchForageWorkflowEdges,
      fetchForageWorkflowNodes,
      fetchForageWorkflowPiecesData,
      fetchWorkflowSettingsData,
    ],
  );

  const clearForageData = useCallback(async () => {
    await Promise.allSettled([
      clearReactWorkflowPersistence(),
      clearForageWorkflowPieces(),
      clearForageWorkflowPiecesData(),
      clearWorkflowSettingsData(),
    ]);
  }, [
    clearReactWorkflowPersistence,
    clearForageWorkflowPieces,
    clearForageWorkflowPiecesData,
    clearWorkflowSettingsData,
  ]);

  const value: IWorkflowsEditorContext = {
    repositories,
    repositoryPieces,
    repositoriesError,
    repositoriesLoading,
    fetchRepoById,
    fetchForagePieceById,
    search,
    handleSearch,

    importWorkflowToForage,

    setWorkflowEdges,
    setWorkflowNodes,
    fetchForageWorkflowEdges,
    fetchForageWorkflowNodes,
    clearReactWorkflowPersistence,

    setForageWorkflowPieces,
    setForageWorkflowPiecesOutputSchema,
    fetchWorkflowPieceById,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    clearForageWorkflowPieces,

    setForageWorkflowPiecesData,
    setForageWorkflowPiecesDataById,
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    removeForageWorkflowPieceDataById,
    clearForageWorkflowPiecesData,
    clearDownstreamDataById,

    setWorkflowSettingsData,
    fetchWorkflowSettingsData,
    clearWorkflowSettingsData,

    handleCreateWorkflow,
    fetchWorkflowForage,
    generateWorkflowsEditorBodyParams,
    clearForageData,
  };

  return (
    <WorkflowsEditorContext.Provider value={value}>
      {children}
    </WorkflowsEditorContext.Provider>
  );
};

export default WorkflowsEditorProvider;
