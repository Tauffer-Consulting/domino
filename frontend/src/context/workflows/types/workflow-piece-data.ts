import { IContainerResourceFormData } from "./container-resources"
import { InputArray, Input } from "./input"
import { IStorageFormData } from "./storage"

export type IWorkflowPieceData = {
  storage:IStorageFormData,
  containerResources: IContainerResourceFormData,
  inputs: Record<string,Input | InputArray>

}
