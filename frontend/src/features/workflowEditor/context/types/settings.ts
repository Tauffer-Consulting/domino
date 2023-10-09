export enum scheduleIntervals {
  None = "none",
  Once = "once",
  Hourly = "hourly",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

export type ScheduleIntervals = `${scheduleIntervals}`;

export enum endDateTypes {
  Never = "never",
  UserDefined = "User defined",
}

export type EndDateTypes = `${endDateTypes}`;

export enum storageSourcesAWS {
  None = "None",
  AWS_S3 = "AWS S3",
}

export type StorageSourcesAWS = `${storageSourcesAWS}`;

export enum storageSourcesLocal {
  None = "None",
  Local = "Local",
}

export type StorageSourcesLocal = `${storageSourcesLocal}`;

export interface IWorkflowSettingsConfig {
  name: string;
  scheduleInterval: ScheduleIntervals;
  startDate: string;
  endDate?: string;
  endDateType: EndDateTypes;
}

export interface IWorkflowSettingsStorage {
  storageSource: StorageSourcesAWS | StorageSourcesLocal;
  baseFolder?: string;
  bucket?: string;
}
export interface IWorkflowSettings {
  config: IWorkflowSettingsConfig;
  storage: IWorkflowSettingsStorage;
}
