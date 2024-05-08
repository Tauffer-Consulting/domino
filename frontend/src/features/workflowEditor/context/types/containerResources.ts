export interface IContainerResourceFormData {
  useGpu: boolean;
  cpu: number;
  memory: number;
}

// TODO - remove this in future releases
// @deprecated
export interface IContainerResourceFormDataOld {
  useGpu: boolean;
  cpu: {
    min: number;
    max: number;
  };
  memory: {
    min: number;
    max: number;
  };
}
