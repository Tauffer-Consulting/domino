type WorkflowPieceID =
  | `${number}_${string}-${string}-${string}-${string}-${string}`
  | string;

export function getUuidSlice(workflowPieceID: WorkflowPieceID) {
  return workflowPieceID.split("_")[1].split("-")[0];
}

export function getUuid(workflowPieceID: WorkflowPieceID) {
  return workflowPieceID.split("_")[1];
}

export function getIdSlice(workflowPieceID: WorkflowPieceID) {
  return parseInt(workflowPieceID.split("_")[0]);
}
