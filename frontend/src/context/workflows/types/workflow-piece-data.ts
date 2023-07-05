import { IContainerResourceFormData } from "./container-resources"
import { IStorageFormData } from "./storage"

export type IWorkflowPieceData = {
  storage:IStorageFormData,
  containerResources: IContainerResourceFormData,
  inputs: {
    [formKey:string]:{
      fromUpstream: boolean, //? allowed | never | always
      upstreamArgument: string | null,
      upstreamId: string | null,  
      value: string | any
    }
  }
}
