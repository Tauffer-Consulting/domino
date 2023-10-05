/* eslint-disable no-prototype-builtins */
import { Paper, Typography } from "@mui/material";
import { taskState } from "features/workflows/types";
import theme from "providers/theme.config";
import React, { memo, useCallback, useMemo } from "react";
import { type Position, Handle } from "reactflow";
import { getUuidSlice } from "utils";

import { type RunNodeProps } from "../types";

const RunNode = memo<RunNodeProps>(
  ({ id, sourcePosition, targetPosition, data, selected }) => {
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
          colors.color = theme.palette.getContrastText(
            theme.palette.info.light,
          );
          break;

        case taskState.failed:
          colors.backgroundColor = theme.palette.error.light;
          colors.color = theme.palette.getContrastText(
            theme.palette.error.light,
          );
          break;
      }

      return colors;
    }, []);

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

    const nodeStyle = useMemo(() => {
      let style: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        position: "relative",

        height: 60,
        lineHeight: "60px",
      };

      if (data?.style.hasOwnProperty("nodeStyle")) {
        style = Object.assign(style, data.style.nodeStyle);
      }

      if (data.state) {
        style = Object.assign(style, getTaskStatusColor(data.state));
      }

      return style;
    }, [data]);

    return (
      <>
        {nodeTypeRenderHandleMap[extendedClassExt].renderSourceHandle && (
          <Handle
            type="source"
            position={sourcePosition as Position}
            id={`source-${id}`}
            style={handleStyle}
          />
        )}
        {nodeTypeRenderHandleMap[extendedClassExt].renderTargetHandle && (
          <Handle
            type="target"
            position={targetPosition as Position}
            id={`target-${id}`}
            style={handleStyle}
          />
        )}
        <Paper elevation={selected ? 12 : 3} sx={nodeStyle}>
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
            <Typography
              variant="subtitle1"
              color="text.secondary"
              style={{ fontSize: 10 }}
            >
              {getUuidSlice(id)}
            </Typography>
          </div>
        </Paper>
      </>
    );
  },
);

RunNode.displayName = "RunNode";

export default RunNode;
