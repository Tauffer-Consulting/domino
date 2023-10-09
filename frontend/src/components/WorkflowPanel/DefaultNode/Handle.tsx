import theme from "providers/theme.config";
import React, { type CSSProperties, useMemo } from "react";
import { Handle, type HandleProps } from "reactflow";

const _targetStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "16px",
  borderColor: "transparent",
  backgroundColor: theme.palette.grey[400],
  transition: "ease 100ms",
  zIndex: 2,
};

const sourceStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "16px",
  borderColor: "transparent",
  backgroundColor: theme.palette.grey[400],
  transition: "ease 100",
  zIndex: 2,
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
        zIndex: 2,
      };
    } else {
      return sourceStyle;
    }
  }, [props.type, props.position, hovered]);

  return <Handle {...props} style={styles} />;
};

export default CustomHandle;
