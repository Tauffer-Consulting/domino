import React from "react";
import {
  getBezierPath,
  type ConnectionLineComponentProps,
  BaseEdge,
} from "reactflow";

export const CustomConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
}) => {
  const [linePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      <BaseEdge
        path={linePath}
        style={{
          strokeWidth: 2,
        }}
      />
    </g>
  );
};
