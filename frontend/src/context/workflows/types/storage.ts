export enum storageAccessModes {
  None = "None",
  Read = "Read",
  ReadWrite = "Read/Write",
}
 
/**
 * This is equivalent to:
 * type storageAccessModeType = 'None' | 'Read' | 'Read/Write';
 */
export type storageAccessModeType = keyof typeof storageAccessModes;

export interface IStorageFormData {
  storageAccessMode: storageAccessModeType,
}
