import { type IWorkflowElement } from "features/myWorkflows/types";
import { type Edge } from "reactflow";

import {
  type IContainerResourceFormDataOld,
  type IContainerResourceFormData,
} from "./containerResources";
import { type InputArray, type Input } from "./input";
import {
  type EndDateTypes,
  type ScheduleIntervals,
  type StorageSourcesAWS,
  type StorageSourcesLocal,
  type StartDateTypes,
} from "./settings";
import { type IStorageFormData, type StorageAccessModes } from "./storage";

export interface WorkflowPieceData {
  storage: IStorageFormData;
  containerResources:
    | IContainerResourceFormData
    | IContainerResourceFormDataOld;
  inputs: Record<string, Input | InputArray>;
}

interface WorkflowBaseSettings {
  name: string;
  select_start_date: StartDateTypes;
  start_date?: string; // ISOFormat
  select_end_date: EndDateTypes;
  schedule: ScheduleIntervals;

  end_date?: string; // ISOFormat
  catchup?: boolean;
  generate_report?: boolean;
  description?: string;
}

interface UiSchema {
  nodes: Record<string, IWorkflowElement>;
  edges: Edge[];
}

interface WorkflowSharedStorageDataModel {
  source: StorageSourcesLocal | StorageSourcesAWS;

  mode: StorageAccessModes;
  provider_options?: ProviderOptionS3;
}

interface ProviderOptionS3 {
  bucket?: string;
  base_folder?: string;
}

interface SystemRequirementsModel {
  cpu: number;
  memory: number;
}
interface ContainerResourcesDataModel {
  requests: SystemRequirementsModel;
  limits: SystemRequirementsModel;
  use_gpu: boolean;
}

export interface TasksDataModel {
  workflow_shared_storage: WorkflowSharedStorageDataModel;
  container_resources: ContainerResourcesDataModel;
  task_id: string;
  piece: {
    name: string;
    source_image: string;
  };
  piece_input_kwargs: Record<string, any>;
  dependencies?: string[];
}

type TasksDict = Record<string, TasksDataModel>;

export interface CreateWorkflowRequest {
  workflow: WorkflowBaseSettings;
  tasks: TasksDict;
  ui_schema: UiSchema;
}
