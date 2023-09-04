import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import { Grid, List, ListItem, Chip, Typography } from "@mui/material";
import { type IWorkflowRunTasks } from "services/requests/runs";

import { taskStatesColorMap } from "../../../../../constants";

interface IWorkflowRunTasksExtended extends IWorkflowRunTasks {
  operatorName: string;
}

interface ITaskDetailsProps {
  taskData: IWorkflowRunTasksExtended;
}

export const TaskDetails = (props: ITaskDetailsProps) => {
  // @todo use style components instead of inline styles

  return (
    <Grid container mt={5}>
      <Grid item xs={12}>
        <List>
          <ListItem sx={{ justifyContent: "space-between", marginTop: "10px" }}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              State:
            </Typography>
            <Typography
              variant="body1"
              component="span"
              sx={{ display: "flex" }}
              fontWeight="500"
              color="text.secondary"
            >
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
            </Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: "space-between", marginTop: "10px" }}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              Operator:
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex" }}
              color="text.secondary"
              fontWeight="500"
            >
              {props.taskData.operatorName}
            </Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: "space-between", marginTop: "10px" }}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              Start Date:
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex" }}
              color="text.secondary"
              fontWeight="500"
            >
              <CalendarMonthIcon sx={{ marginRight: "8px" }} />
              {new Date(props.taskData.start_date).toLocaleString()}
            </Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: "space-between", marginTop: "10px" }}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              End Date:
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex" }}
              color="text.secondary"
              fontWeight="500"
            >
              <CalendarMonthIcon sx={{ marginRight: "8px" }} />
              {new Date(props.taskData.end_date).toLocaleString()}
            </Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: "space-between", marginTop: "10px" }}>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              Duration:
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex" }}
              color="text.secondary"
              fontWeight="500"
            >
              <TimelapseIcon sx={{ marginRight: "8px" }} />
              {new Date(1000 * props.taskData.duration)
                .toISOString()
                .substring(11, 19)}
            </Typography>
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
};
