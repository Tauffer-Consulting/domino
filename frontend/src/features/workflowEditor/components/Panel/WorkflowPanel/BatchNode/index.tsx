import { Paper, Typography, useTheme } from "@mui/material";
import { type CSSProperties, memo, useMemo } from "react";
import { Handle, Position } from "reactflow";
import { Icon } from "@iconify/react";

import { type DefaultNodeProps } from "../types";

export const BatchNode = memo<DefaultNodeProps>(({ id, data, selected }) => {
    const theme = useTheme();

    const handleStyle = useMemo<CSSProperties>(
        () => ({
            border: 0,
            borderRadius: "16px",
            backgroundColor: theme.palette.info.main,
            transition: "ease 100",
            zIndex: 2,
            width: "12px",
            height: "12px",
        }),
        [theme.palette.info.main]
    );

    const nodeStyle = useMemo<CSSProperties>(
        () => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: 1,
            textAlign: "center",
            width: "100px", // Adjusted width to make it a square
            height: "100px", // Adjusted height to make it a square
            lineHeight: "60px",
            border: selected ? `2px solid ${theme.palette.info.dark}` : "2px solid transparent", // Border color change based on selection
            color: theme.palette.getContrastText(theme.palette.background.paper),
            backgroundColor: theme.palette.background.paper,
            borderRadius: "3px",
        }),
        [selected, theme.palette]
    );

    const iconStyle = useMemo<CSSProperties>(
        () => ({
            width: "50px", // Adjusted width of the icon
            height: "50px", // Adjusted height of the icon
            marginBottom: "10px", // Added margin bottom to space out from text
        }),
        []
    );

    const labelStyle = {
        fontSize: "8px",
        position: "absolute",
        textAlign: "left",
        justifyContent: "left",
        right: "-25px",
        top: "10px"
    };

    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                id={`target-${id}`}
                style={{
                    ...handleStyle,
                }}
                isConnectable
                isValidConnection={(connection) => connection.sourceHandle !== `target-${id}`}
            />
            <Handle
                type="source"
                position={Position.Right}
                id={`source-done-${id}`}
                style={{
                    ...handleStyle,
                    transform: "translate(0%, -30px)", // Adjusted handle position up by 30px
                }}
                isConnectable
            >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ...labelStyle }}>DONE</Typography>
            </Handle>
            <Handle
                type="source"
                position={Position.Right}
                id={`source-batch-${id}`}
                style={{
                    ...handleStyle,
                    transform: "translate(0%, 25px)", // Adjusted handle position down by 30px
                    backgroundColor: theme.palette.success.main,
                }}
                isConnectable
            >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ...labelStyle }}>BATCH</Typography>
            </Handle>
            <Paper elevation={selected ? 12 : 3} sx={nodeStyle}>
                <Typography component="div" variant="body2" fontWeight={500}>
                    Batch Piece
                </Typography>
                <Icon icon="ic:baseline-loop" style={iconStyle} />
            </Paper>
        </>
    );
});

BatchNode.displayName = "BatchNode";

export default BatchNode;
