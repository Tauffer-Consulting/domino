import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  MarkerType,
} from "reactflow";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={MarkerType.ArrowClosed}
      style={{
        position: "absolute",
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        color: "#6a6a6e",
        width: 30,
        height: 30,
        pointerEvents: "all",
      }}
    />
  );
}
