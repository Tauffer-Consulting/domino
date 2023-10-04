import { getUuid } from "./getUuidSlice";

export function generateTaskName(pieceName: string, pieceId: string) {
  const hashId = getUuid(pieceId).replaceAll("-", "");
  const pieceNameTrunk = pieceName.replaceAll(" ", "").slice(0, 10);
  const taskName = `${pieceNameTrunk}_${hashId}`;
  return taskName;
}
