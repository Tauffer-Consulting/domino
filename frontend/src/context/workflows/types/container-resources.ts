export interface IContainerResourceFormData {
  useGpu: boolean,
  cpu:{
    min:number,
    max: number,
  },
  memory:{
    min:number,
    max: number,
  }
}
