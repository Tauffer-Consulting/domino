import { IWorkflowElement } from "services/requests/workflow"
import { IContainerResourceFormData } from "./container-resources"
import { InputArray, Input } from "./input"
import { EndDateTypes, ScheduleIntervals, StorageSourcesAWS, StorageSourcesLocal } from "./settings"
import { IStorageFormData, StorageAccessModes } from "./storage"
import { Edge } from "reactflow"

export type IWorkflowPieceData = {
  storage: IStorageFormData,
  containerResources: IContainerResourceFormData,
  inputs: Record<string, Input | InputArray>

}

interface WorkflowBaseSettings {
  name: string
  start_date: string // ISOFormat
  select_end_date: EndDateTypes
  schedule_interval: ScheduleIntervals

  end_date?: string // ISOFormat
  catchup?: boolean
  generate_report?: boolean
  description?: string
}

interface UiSchema {
  nodes: Record<string, IWorkflowElement>
  edges: Edge[]
}

type WorkflowSharedStorageDataModel = {
  source: StorageSourcesLocal | StorageSourcesAWS
  base_folder?: string
  mode: StorageAccessModes
  provider_options?: Record<string, unknown>
}


interface SystemRequirementsModel {
  cpu: number
  memory: number
}
interface ContainerResourcesDataModel {
  requests: SystemRequirementsModel
  limits: SystemRequirementsModel
  use_gpu: boolean
}

export interface TasksDataModel {
  workflow_shared_storage: WorkflowSharedStorageDataModel
  container_resources: ContainerResourcesDataModel
  task_id: string
  piece: {
    id: number
    name: string
  }
  piece_input_kwargs: Record<string, any>
  dependencies?: string[]
}

type TasksDict = Record<string, TasksDataModel>

export type CreateWorkflowRequest = {
  workflow: WorkflowBaseSettings,
  tasks: TasksDict,
  ui_schema: UiSchema,
}
