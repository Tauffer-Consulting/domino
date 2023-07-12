import { IContainerResourceFormData } from "./container-resources"
import { IInput } from "./input"
import { IStorageFormData } from "./storage"

export type IWorkflowPieceData = {
  storage:IStorageFormData,
  containerResources: IContainerResourceFormData,
  inputs: Record<string,IInput>
}
