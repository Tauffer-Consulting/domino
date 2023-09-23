import {
  BaseEdge,
  type EdgeProps,
  // getSmoothStepPath,
  getBezierPath,
  MarkerType,
} from "reactflow";

const DefaultEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
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
        color: "#6a6a6e",
        width: 60,
        height: 60,
        pointerEvents: "all",
      }}
    />
  );
};

export default DefaultEdge;
