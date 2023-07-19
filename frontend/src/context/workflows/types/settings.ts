import { Dayjs } from "dayjs";

export enum scheduleIntervals {
    None = "None",
    Once = "Once",
    Hourly = "Hourly",
    Daily = "Daily",
    Weekly = "Weekly",
    Monthly = "Monthly",
    Yearly = "Yearly",
}

export enum endDateTypes {
    Never = "Never",
    UserDefined = "User Defined",
}

export enum storageSources {
    None = "None",
    AWSS3 = "AWS S3",
}

export type storageSourceType = keyof typeof storageSources;
export type endDateTypeType = keyof typeof endDateTypes;
export type scheduleIntervalType = keyof typeof scheduleIntervals;


export interface IWorkflowSettingsConfig {
    name: string,
    scheduleInterval: scheduleIntervalType,
    startDate: Dayjs | string,
    endDate?: Dayjs | string,
    endDateType: endDateTypeType,
}

export interface IWorkflowSettingsStorage {
    storageSource: storageSourceType,
    baseFolder: string,
    bucket: string
}
export interface IWorkflowSettings {
    config: IWorkflowSettingsConfig
    storage: IWorkflowSettingsStorage
}
