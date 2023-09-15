import theme from "providers/theme.config";
import React, { type CSSProperties, useMemo } from "react";
import { Handle, Position, type HandleProps } from "reactflow";

const targetStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "16px",
  backgroundColor: "transparent",
  transition: "ease 100ms",
};

const sourceStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "16px",
  backgroundColor: "transparent",
  transition: "ease 100ms",
};

interface CustomHandleProps extends HandleProps {
  hovered: boolean;
}

const CustomHandle: React.FC<CustomHandleProps> = ({
  hovered,
  ...props
}: CustomHandleProps) => {
  const styles = useMemo<CSSProperties>(() => {
    if (!hovered) {
      return {
        border: 0,
        borderRadius: "16px",
        backgroundColor: "transparent",
        transition: "ease 100ms",
      };
    }

    if (props.type === "source" && props.position === Position.Right) {
      return {
        ...sourceStyle,
        right: "8px",
        borderLeft: "10px solid",
        borderLeftColor: theme.palette.grey[400],
        borderTop: "10px solid transparent",
        borderBottom: "10px solid transparent",
        float: "left",
      } satisfies CSSProperties;
    }
    if (props.type === "source" && props.position === Position.Bottom) {
      return {
        ...sourceStyle,
        bottom: "-16px",
      } satisfies CSSProperties;
    }
    if (props.type === "target" && props.position === Position.Top) {
      return {
        ...targetStyle,
        top: "-16px",
      } satisfies CSSProperties;
    }
    if (props.type === "target" && props.position === Position.Left) {
      return {
        ...targetStyle,
        left: "-16px",
        borderLeft: "10px solid",
        borderLeftColor: theme.palette.grey[600],
        borderTop: "10px solid transparent",
        borderBottom: "10px solid transparent",
        float: "left",
      } satisfies CSSProperties;
    }
    return {} satisfies CSSProperties;
  }, [props.type, props.position, hovered]);

  return <Handle {...props} style={styles} />;
};

export default CustomHandle;
