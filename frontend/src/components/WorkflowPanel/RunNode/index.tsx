/* eslint-disable no-prototype-builtins */
import { Paper, Typography } from "@mui/material";
import { taskState } from "features/workflows/types";
import theme from "providers/theme.config";
import React, { memo, useCallback, useMemo } from "react";
import { Position, Handle } from "reactflow";
import { getUuidSlice } from "utils";

import { type RunNodeProps } from "../types";

const RunNode = memo(({ id, data: extendedData, selected }: RunNodeProps) => {
  const extendedClassExt = useMemo(() => {
    const dominoReactflowClassTypeMap: any = {
      source: "input",
      default: "default",
      sink: "output",
    };
    if (
      extendedData?.style.nodeType === undefined ||
      !["default", "source", "sink"].includes(extendedData?.style.nodeType)
    ) {
      return "default";
    } else {
      return dominoReactflowClassTypeMap[extendedData?.style.nodeType];
    }
  }, [extendedData]);

  const extendedClass = useMemo(() => {
    return `react-flow__node-${extendedClassExt}`;
  }, [extendedClassExt]);

  const nodeTypeRenderHandleMap = useMemo(
    () =>
      ({
        input: {
          renderTargetHandle: false,
          renderSourceHandle: true,
        },
        output: {
          renderTargetHandle: true,
          renderSourceHandle: false,
        },
        default: {
          renderTargetHandle: true,
          renderSourceHandle: true,
        },
      }) as any,
    [],
  );

  const { targetHandlePosition, sourceHandlePosition } = useMemo(() => {
    return {
      targetHandlePosition: Position.Left,
      sourceHandlePosition: Position.Right,
    };
  }, [extendedData]);

  const { useIcon, iconId, iconClass, iconStyle } = useMemo(() => {
    const useIcon = !!extendedData?.style?.useIcon;
    const iconId =
      useIcon && extendedData?.style?.hasOwnProperty("iconId")
        ? extendedData?.style?.iconId
        : "";
    const iconClass =
      useIcon && extendedData?.style?.hasOwnProperty("iconClassName")
        ? extendedData.style.iconClassName
        : "fas fa-eye";
    let iconStyle: React.CSSProperties = {
      position: "absolute",
      left: "4px",
    };

    if (useIcon && extendedData?.style?.hasOwnProperty("iconStyle")) {
      iconStyle = { ...iconStyle, ...extendedData.style.iconStyle };
    }

    return {
      useIcon,
      iconId,
      iconClass,
      iconStyle,
    };
  }, [extendedData]);

  const getTaskStatusColor = useCallback((state: taskState) => {
    const colors = {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.getContrastText(theme.palette.background.default),
    };

    switch (state) {
      case taskState.success:
        colors.backgroundColor = theme.palette.success.light;
        colors.color = theme.palette.getContrastText(
          theme.palette.success.light,
        );
        break;
      case taskState.running:
        colors.backgroundColor = theme.palette.info.light;
        colors.color = theme.palette.getContrastText(theme.palette.info.light);
        break;

      case taskState.failed:
        colors.backgroundColor = theme.palette.error.light;
        colors.color = theme.palette.getContrastText(theme.palette.error.light);
        break;
    }

    return colors;
  }, []);

  const customStyle = useMemo(() => {
    let style: React.CSSProperties = {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",

      position: "relative",

      height: 60,
      lineHeight: "60px",
    };

    if (extendedData?.style.hasOwnProperty("nodeStyle")) {
      style = Object.assign(style, extendedData.style.nodeStyle);
    }

    if (extendedData.state) {
      style = Object.assign(style, getTaskStatusColor(extendedData.state));
    }

    return style;
  }, [extendedData]);

  return (
    <>
      {nodeTypeRenderHandleMap[extendedClassExt].renderTargetHandle ? (
        <Handle
          type="target"
          id={`$handle-target-${id}`}
          position={targetHandlePosition}
        />
      ) : null}
      <Paper
        id={id}
        elevation={selected ? 12 : 3}
        className={extendedClass}
        style={customStyle}
      >
        {useIcon ? (
          <span id={iconId} style={iconStyle}>
            <i className={iconClass} />
          </span>
        ) : null}
        <div style={{ marginLeft: "4px" }}>
          <Typography
            component="div"
            variant="h5"
            style={{ fontSize: 12 }}
            fontWeight={500}
          >
            {extendedData?.style?.label
              ? extendedData?.style?.label
              : extendedData?.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            style={{ fontSize: 10 }}
          >
            {getUuidSlice(id)}
          </Typography>
        </div>
      </Paper>
      {nodeTypeRenderHandleMap[extendedClassExt].renderSourceHandle ? (
        <Handle
          type="source"
          id={`$handle-source-${id}`}
          position={sourceHandlePosition}
        />
      ) : null}
    </>
  );
});

RunNode.displayName = "RunNode";

export default RunNode;
