import {
  Switch,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
} from "@mui/material";
import { useState, useMemo, type CSSProperties } from "react";

interface ITaskLogsProps {
  logs: string[];
}

export const TaskLogs = ({ logs }: ITaskLogsProps) => {
  const [renderOverflowX, setRenderOverflowX] = useState<boolean>(true);

  /* TODO
   * const logsTypeColorMap = {
   *     'INFO': '#64df46',
   *     'ERROR': '#f00',
   *     'WARNING': '#f90',
   *     'DEBUG': '#00f',
   * }
   */

  const logContent = useMemo(() => {
    return logs.length ? logs.join("\n") : "No logs available";
  }, [logs]);

  const textareaStyle: CSSProperties = useMemo(() => {
    return {
      width: "100%",
      height: "100%",
      border: "none",
      overflowX: renderOverflowX ? "hidden" : "scroll",
      overflowY: "scroll",
      whiteSpace: renderOverflowX ? "pre-wrap" : "pre",
      wordWrap: renderOverflowX ? "break-word" : "normal",
      outline: "none",
    };
  }, [renderOverflowX]);

  return (
    <Box sx={{ p: 3, height: "95%" }}>
      <FormGroup sx={{ marginBottom: "8px" }}>
        <FormControlLabel
          control={
            <Switch
              defaultChecked
              onChange={() => {
                setRenderOverflowX(!renderOverflowX);
              }}
            />
          }
          label="Wrap text horizontally."
        />
      </FormGroup>
      <Typography component="pre" variant="body1" sx={textareaStyle}>
        {logContent}
      </Typography>
    </Box>
  );
};
