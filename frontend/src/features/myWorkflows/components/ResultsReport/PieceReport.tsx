import { Chip, Container, Divider, Grid, Typography } from "@mui/material";
import { RenderB64 } from "components/RenderB64";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { type IWorkflowRunTasks } from "features/myWorkflows/types";
import React, { useMemo } from "react";

dayjs.extend(duration);
interface Props {
  id: string;
  taskData: IWorkflowRunTasks & {
    pieceName: string;
    base64_content: string;
    file_type: string;
  };
}

export const PieceReport: React.FC<Props> = ({ taskData, id }) => {
  const { startDate, endDate, duration } = useMemo(() => {
    if (!taskData.start_date || !taskData.end_date || !taskData.duration) {
      return {
        startDate: null,
        endDate: null,
        duration: null,
      };
    }

    const durationRaw = dayjs.duration(taskData.duration * 1000);

    const duration = `${durationRaw.hours()} ${
      durationRaw.hours() > 1 ? "hours" : "hour"
    } : ${durationRaw.minutes()} ${
      durationRaw.minutes() > 1 ? "minutes" : "minute"
    } : ${durationRaw.seconds()} ${
      durationRaw.seconds() > 1 ? "seconds" : "second"
    }`;

    const startDate = dayjs(taskData.start_date).format("YYYY-MM-DD HH:mm:ss");
    const endDate = dayjs(taskData.end_date).format("YYYY-MM-DD HH:mm:ss");
    return {
      duration,
      startDate,
      endDate,
    };
  }, [taskData]);

  return (
    <Grid id={id} container item xs={4} style={{ width: "100%" }}>
      <Grid item xs={12}>
        <Divider variant="middle">
          <Chip
            label={taskData.pieceName}
            color={taskData.state as any}
            sx={{
              fontSize: 20,
            }}
          />
        </Divider>
      </Grid>

      <Grid item xs={12}>
        {/* This is the result (if exists) */}
        <Container>
          <RenderB64
            base64_content={taskData.base64_content}
            file_type={taskData.file_type}
          />
        </Container>
      </Grid>

      <Grid item xs={12} justifySelf="flex-end" marginRight={2}>
        <Container
          sx={{
            marginRight: 0,
            paddingRight: 0,
            marginTop: "30mm",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          {startDate ? (
            <Typography variant="caption" display="block" gutterBottom>
              Start date: {startDate}{" "}
            </Typography>
          ) : null}
          {endDate ? (
            <Typography variant="caption" display="block" gutterBottom>
              End date: {endDate}{" "}
            </Typography>
          ) : null}
          {duration ? (
            <Typography variant="caption" display="block" gutterBottom>
              Duration: {duration}{" "}
            </Typography>
          ) : null}
        </Container>
      </Grid>
    </Grid>
  );
};
