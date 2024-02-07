import { useWorkspaces } from "context/workspaces";
import {
  type IPostWorkflowParams,
  useAuthenticatedPostWorkflow,
} from "features/myWorkflows/api";
import {
  type IWorkflowElement,
  type IPostWorkflowResponseInterface,
} from "features/myWorkflows/types";
import React, { type FC, useCallback } from "react";
import { type Edge } from "reactflow";
import { createCustomContext, generateTaskName } from "utils";

import {
  type IWorkflowSettings,
  type CreateWorkflowRequest,
  type TasksDataModel,
} from "./types";
import {
  useWorkflowPanel,
  type IWorkflowPanelContext,
  type StoragePiecesData,
} from "./workflowPanelContext";
import {
  useWorkflowSettings,
  type IWorkflowSettingsContext,
} from "./workflowSettingsData";

export interface GenerateWorkflowsParams {
  workflowPieces: Record<string, Piece>;
  workflowPiecesData: StoragePiecesData;
  workflowSettingsData: IWorkflowSettings;
  workflowNodes: IWorkflowElement[];
  workflowEdges: Edge[];
}

interface IWorkflowsEditorContext
  extends IWorkflowPanelContext,
    IWorkflowSettingsContext {
  getWorkflow: () => GenerateWorkflowsParams;
  importWorkflowToStorage: (importedWorkflow: GenerateWorkflowsParams) => void;
  generateWorkflowsEditorBodyParams: (
    p: GenerateWorkflowsParams,
  ) => CreateWorkflowRequest;
  handleCreateWorkflow: (
    params: IPostWorkflowParams,
  ) => Promise<IPostWorkflowResponseInterface>;
  clearStorageData: () => void;
}

export const [WorkflowsEditorContext, useWorkflowsEditor] =
  createCustomContext<IWorkflowsEditorContext>("WorkflowsEditor Context");

const WorkflowsEditorProvider: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { workspace } = useWorkspaces();
  const postWorkflow = useAuthenticatedPostWorkflow();

  const {
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
  } = useWorkflowPanel();

  const {
    getWorkflowSettingsData,
    setWorkflowSettingsData,
    clearWorkflowSettingsData,
  } = useWorkflowSettings();

  const getWorkflow = useCallback(() => {
    const workflowPieces = getWorkflowPieces();
    const workflowPiecesData = getWorkflowPiecesData();
    const workflowSettingsData = getWorkflowSettingsData();
    const workflowNodes = getWorkflowNodes();
    const workflowEdges = getWorkflowEdges();
    const result: GenerateWorkflowsParams = {
      workflowPieces,
      workflowPiecesData,
      workflowSettingsData,
      workflowNodes,
      workflowEdges,
    };
    return result;
  }, [
    getWorkflowPieces,
    getWorkflowPiecesData,
    getWorkflowSettingsData,
    getWorkflowNodes,
    getWorkflowEdges,
  ]);

  const importWorkflowToStorage = useCallback(
    async (dominoWorkflow: GenerateWorkflowsParams) => {
      setWorkflowPieces(dominoWorkflow.workflowPieces);
      setWorkflowPiecesData(dominoWorkflow.workflowPiecesData);
      setWorkflowSettingsData(dominoWorkflow.workflowSettingsData);
      setWorkflowNodes(dominoWorkflow.workflowNodes);
      setWorkflowEdges(dominoWorkflow.workflowEdges);
    },
    [
      setWorkflowPieces,
      setWorkflowPiecesData,
      setWorkflowSettingsData,
      setWorkflowNodes,
      setWorkflowEdges,
    ],
  );

  const generateWorkflowsEditorBodyParams = useCallback(
    ({
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
            if (!value.fromUpstream && !value.value.length) {
              return acc;
            }
            if (
              value.fromUpstream &&
              !value.upstreamId &&
              !value.upstreamArgument
            ) {
              return acc;
            }

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

          if (!value.fromUpstream && !value.value) {
            return acc;
          }
          if (
            value.fromUpstream &&
            !value.upstreamId &&
            !value.upstreamArgument
          ) {
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
        forageSchema: {
          workflowPieces,
          workflowPiecesData,
          workflowNodes,
          workflowEdges,
        },
        workflow,
        tasks,
        ui_schema,
      };
    },
    [],
  );

  const handleCreateWorkflow = useCallback(
    async (payload: IPostWorkflowParams) => {
      return await postWorkflow({
        ...payload,
        workspace_id: workspace?.id ?? "",
      });
    },
    [postWorkflow, workspace],
  );

  const clearStorageData = useCallback(() => {
    clearWorkflowPanelContext();
    clearWorkflowSettingsData();
  }, [clearWorkflowPanelContext, clearWorkflowSettingsData]);

  const value: IWorkflowsEditorContext = {
    setWorkflowEdges,
    setWorkflowNodes,
    getWorkflowEdges,
    getWorkflowNodes,

    setWorkflowPieces,
    setWorkflowPieceOutputSchema,
    getWorkflowPieceById,
    getWorkflowPieces,
    deleteWorkflowPieceById,

    setWorkflowPiecesData,
    setWorkflowPieceDataById,
    getWorkflowPiecesData,
    getWorkflowPieceDataById,
    deleteWorkflowPieceDataById,
    clearDownstreamDataById,

    clearWorkflowPanelContext,

    setWorkflowSettingsData,
    getWorkflowSettingsData,
    clearWorkflowSettingsData,

    getWorkflow,
    importWorkflowToStorage,
    generateWorkflowsEditorBodyParams,
    handleCreateWorkflow,
    clearStorageData,
  };

  return (
    <WorkflowsEditorContext.Provider value={value}>
      {children}
    </WorkflowsEditorContext.Provider>
  );
};

export default WorkflowsEditorProvider;
