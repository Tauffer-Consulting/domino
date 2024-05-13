/* eslint-disable no-prototype-builtins */
import { Icon } from "@iconify/react";
import { Paper, Typography, useTheme } from "@mui/material";
import { taskState } from "features/myWorkflows/types";
import React, { type CSSProperties, memo, useCallback, useMemo } from "react";
import { Position, Handle } from "reactflow";
import { getUuidSlice } from "utils";

import { type RunNodeProps } from "../types";

const RunNode = memo<RunNodeProps>(({ id, data, selected }) => {
  const theme = useTheme();

  const extendedClassExt = useMemo(() => {
    const dominoReactflowClassTypeMap: any = {
      source: "input",
      default: "default",
      sink: "output",
    };
    if (
      data?.style.nodeType === undefined ||
      !["default", "source", "sink"].includes(data?.style.nodeType)
    ) {
      return "default";
    } else {
      return dominoReactflowClassTypeMap[data?.style.nodeType];
    }
  }, [data]);

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

  const handleStyle = useMemo(
    () => ({
      border: 0,
      borderRadius: "16px",
      backgroundColor: theme.palette.grey[400],
      transition: "ease 100",
      zIndex: 2,
    }),
    [],
  );

  const getTaskColor = useCallback((data: RunNodeProps["data"]) => {
    const colors = {
      color: data.style.nodeStyle.color
        ? data.style.nodeStyle.color
        : theme.palette.getContrastText(
            data.style.nodeStyle.backgroundColor
              ? data.style.nodeStyle.backgroundColor
              : theme.palette.background.paper,
          ),
      backgroundColor: data.style.nodeStyle.backgroundColor
        ? data.style.nodeStyle.backgroundColor
        : theme.palette.background.paper,
    };

    switch (data.state) {
      case taskState.success:
        colors.backgroundColor = theme.palette.success.main;
        colors.color = theme.palette.getContrastText(
          theme.palette.success.main,
        );
        break;
      case taskState.running:
        colors.backgroundColor = theme.palette.info.light;
        colors.color = theme.palette.getContrastText(theme.palette.info.light);
        break;

      case taskState.failed:
        colors.backgroundColor = theme.palette.error.main;
        colors.color = theme.palette.getContrastText(theme.palette.error.main);
        break;
    }

    return colors;
  }, []);

  const nodeStyle = useMemo<CSSProperties>(() => {
    return {
      ...data.style.nodeStyle,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      textAlign: "center",
      position: "relative",
      padding: 1,
      width: 150,
      height: 70,
      lineHeight: "60px",
      border: "2px",
      borderStyle: "solid",
      borderRadius: "3px",
      borderColor: selected ? theme.palette.info.dark : "",
      ...getTaskColor(data),
    };
  }, [data, selected]);

  const { sourcePosition, targetPosition } = useMemo(
    () => ({
      ...(data.orientation === "horizontal"
        ? {
            targetPosition: Position.Left,
            sourcePosition: Position.Right,
          }
        : {
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
          }),
    }),
    [data],
  );

  const icon = useMemo(() => {
    if (data.style.useIcon) {
      const name = data.style.iconClassName;
      return {
        name,
        style: {
          width: "20px",
          height: "20px",
          margin: "5px",
          ...data.style.iconStyle,
        },
      };
    }
  }, [data]);

  return (
    <>
      {nodeTypeRenderHandleMap[extendedClassExt].renderSourceHandle && (
        <Handle
          type="source"
          position={sourcePosition}
          id={`source-${id}`}
          style={handleStyle}
        />
      )}
      {nodeTypeRenderHandleMap[extendedClassExt].renderTargetHandle && (
        <Handle
          type="target"
          position={targetPosition}
          id={`target-${id}`}
          style={handleStyle}
        />
      )}
      <Paper elevation={selected ? 12 : 3} sx={nodeStyle}>
        {icon && <Icon icon={icon.name} style={icon.style} />}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            component="div"
            variant="h5"
            style={{ fontSize: 12 }}
            fontWeight={500}
          >
            {data?.style?.label ? data?.style?.label : data?.name}
          </Typography>
          <Typography variant="subtitle1" style={{ fontSize: 10 }}>
            {getUuidSlice(id)}
          </Typography>
        </div>
      </Paper>
    </>
  );
});

RunNode.displayName = "RunNode";

export default RunNode;
