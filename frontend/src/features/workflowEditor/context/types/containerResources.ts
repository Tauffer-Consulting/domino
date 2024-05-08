export interface IContainerResourceFormData {
  useGpu: boolean;
  cpu: number;
  memory: number;
}

// @deprecated - TODO - remove this in future releases
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
