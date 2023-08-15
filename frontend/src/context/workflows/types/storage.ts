export enum storageAccessModes {
  None = "None",
  Read = "Read",
  ReadWrite = "Read/Write",
}
// Equivalent to type StorageAccessModes = "None" | "Read" | "Read/Write"
export type StorageAccessModes = `${storageAccessModes}`

export interface IStorageFormData {
  storageAccessMode: StorageAccessModes,
}
