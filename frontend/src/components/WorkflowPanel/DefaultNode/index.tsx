/* eslint-disable no-prototype-builtins */
import { Paper, Typography } from "@mui/material";
import theme from "providers/theme.config";
import React, { memo, useMemo, useState } from "react";
import { Position, type NodeProps } from "reactflow";
import { getUuidSlice } from "utils";

import CustomHandle from "./Handle";

interface IStyleData {
  iconClassName: string;
  iconStyle: object;
  label: string;
  module: string;
  nodeStyle: object;
  nodeType: "default" | "input" | "output";
  useIcon: boolean;
  iconId: string;
}
/**
 * @todo improve dtypes
 */
export interface INodeData {
  name: string;
  style: IStyleData;
  error: boolean;
}

interface CustomNodeProps extends NodeProps {
  data: INodeData;
}

const DefaultNode = memo(
  ({ id, data: extendedData, selected }: CustomNodeProps) => {
    const [hovered, setHovered] = useState(false);

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
      // TODO: deal with orientation

      // return extendedData?.handleOriantation === "horizontal"
      //   ? {
      //       targetHandlePosition: Position.Left,
      //       sourceHandlePosition: Position.Right,
      //     }
      //   : {
      //       targetHandlePosition: Position.Top,
      //       sourceHandlePosition: Position.Bottom,
      //     };

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

    const customStyle = useMemo(() => {
      let style: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        position: "relative",

        height: 60,
        lineHeight: "60px",
        border: selected ? "2px" : "",
        borderStyle: selected ? "solid" : "",
        borderColor: selected ? theme.palette.info.dark : "",
        borderRadius: selected ? "3px" : "",
      };

      if (extendedData?.style.hasOwnProperty("nodeStyle")) {
        style = Object.assign(style, extendedData.style.nodeStyle);
      }

      if (extendedData?.error) {
        style = Object.assign(style, {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.background.paper,
        });
      }

      return style;
    }, [selected, extendedData]);

    return (
      <div
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
      >
        {nodeTypeRenderHandleMap[extendedClassExt].renderTargetHandle ? (
          <CustomHandle
            hovered={hovered}
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
          <CustomHandle
            hovered={hovered}
            type="source"
            id={`$handle-source-${id}`}
            position={sourceHandlePosition}
          />
        ) : null}
      </div>
    );
  },
);

DefaultNode.displayName = "CustomNode";

export default DefaultNode;
