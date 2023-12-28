import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import {
  Grid,
  List,
  ListItem,
  Chip,
  Typography,
  Container,
} from "@mui/material";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { taskStatesColorMap } from "features/myWorkflows/constants";
import { type IWorkflowRunTasks } from "features/myWorkflows/types/runs";
import { useMemo } from "react";

dayjs.extend(duration);

interface IWorkflowRunTasksExtended extends IWorkflowRunTasks {
  pieceName: string;
}

interface ITaskDetailsProps {
  taskData: IWorkflowRunTasksExtended;
}

export const TaskDetails = (props: ITaskDetailsProps) => {
  const duration = useMemo(() => {
    if (props.taskData.duration) {
      const duration = dayjs.duration(props.taskData.duration * 1000);

      return `${duration.hours()} ${
        duration.hours() > 1 ? "hours" : "hour"
      } : ${duration.minutes()} ${
        duration.minutes() > 1 ? "minutes" : "minute"
      } : ${duration.seconds()} ${
        duration.seconds() > 1 ? "seconds" : "second"
      }`;
    } else {
      return "Not done yet";
    }
  }, [props.taskData.duration]);

  const formatDate = (date?: string | null) => {
    return date
      ? dayjs(date).format("YYYY-MM-DD HH:mm:ss")
      : "Not executed yet";
  };

  return (
    <Container
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "top",
        justifyContent: "center",
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <List>
            <ListItem
              sx={{ justifyContent: "space-between", marginTop: "10px" }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="500"
              >
                State:
              </Typography>
              {
                <Chip
                  label={props.taskData.state}
                  style={{
                    width: "150px",
                    backgroundColor: taskStatesColorMap[props.taskData.state],
                    color:
                      props.taskData.state in ["none", "default"]
                        ? "black"
                        : "white",
                  }}
                />
              }
            </ListItem>
            <ListItem
              sx={{ justifyContent: "space-between", marginTop: "10px" }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="500"
              >
                Piece:
              </Typography>
              <Typography
                variant="body1"
                sx={{ display: "flex" }}
                color="text.secondary"
                fontWeight="500"
              >
                {props.taskData.pieceName}
              </Typography>
            </ListItem>
            <ListItem
              sx={{ justifyContent: "space-between", marginTop: "10px" }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="500"
              >
                Start Date:
              </Typography>
              <Typography
                variant="body1"
                sx={{ display: "flex" }}
                color="text.secondary"
                fontWeight="500"
              >
                <CalendarMonthIcon sx={{ marginRight: "8px" }} />
                {formatDate(props.taskData.start_date)}
              </Typography>
            </ListItem>
            <ListItem
              sx={{ justifyContent: "space-between", marginTop: "10px" }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="500"
              >
                End Date:
              </Typography>
              <Typography
                variant="body1"
                sx={{ display: "flex" }}
                color="text.secondary"
                fontWeight="500"
              >
                <CalendarMonthIcon sx={{ marginRight: "8px" }} />
                {formatDate(props.taskData.end_date)}
              </Typography>
            </ListItem>
            <ListItem
              sx={{ justifyContent: "space-between", marginTop: "10px" }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="500"
              >
                Duration:
              </Typography>
              <Typography
                variant="body1"
                sx={{ display: "flex" }}
                color="text.secondary"
                fontWeight="500"
              >
                <TimelapseIcon sx={{ marginRight: "8px" }} />
                {duration}
              </Typography>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};
