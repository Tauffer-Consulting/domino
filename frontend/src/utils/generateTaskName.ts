import { getUuid } from "./getUuidSlice"

export function generateTaskName(pieceName:string,pieceId:string){
  const hashId = getUuid(pieceId)
  const pieceNameTrunk = pieceName.slice(0,9)
  const taskName = `${pieceNameTrunk}_${hashId}`
  return taskName
}
