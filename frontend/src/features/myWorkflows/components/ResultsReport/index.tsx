import LogoutIcon from "@mui/icons-material/Logout";
import {
  Button,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { DownloadAsPDF } from "components/DownloadPDF";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  useAuthenticatedGetWorkflowId,
  useAuthenticatedGetWorkflowRunResultReport,
} from "features/myWorkflows/api";
import React, { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PaperA4 } from "./PaperA4";
import { PieceReport } from "./PieceReport";
import { ResultsReportSkeleton } from "./skeleton";

dayjs.extend(duration);

export const ResultsReport: React.FC = () => {
  const { id, runId } = useParams<{ id: string; runId: string }>();

  const navigate = useNavigate();
  const { data } = useAuthenticatedGetWorkflowRunResultReport({
    workflowId: id,
    runId,
  });

  const isPrint = useMediaQuery("print");

  const handleClickScroll = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const { data: workflow } = useAuthenticatedGetWorkflowId({
    id: id as string,
  });

  const { startDate, endDate, duration } = useMemo(() => {
    if (!data?.data) {
      return {
        startDate: null,
        endDate: null,
        duration: null,
      };
    }

    const startDate = dayjs(data?.data[0]?.start_date);
    const endDate = dayjs(data?.data[data?.data.length - 1]?.end_date);

    const durationRaw = dayjs.duration(endDate.diff(startDate));

    const formattedDuration = `${durationRaw.hours()} ${
      durationRaw.hours() > 1 ? "hours" : "hour"
    } : ${durationRaw.minutes()} ${
      durationRaw.minutes() > 1 ? "minutes" : "minute"
    } : ${durationRaw.seconds()} ${
      durationRaw.seconds() > 1 ? "seconds" : "second"
    }`;

    return {
      startDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
      endDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
      duration: formattedDuration,
    };
  }, [data]);

  if (!data?.data) {
    return <ResultsReportSkeleton />;
  }

  return (
    <Grid
      container
      spacing={2}
      style={{
        height: `86vh`,
        width: "100%",
        margin: 0,
      }}
    >
      <Grid item xs={12}>
        <Button
          onClick={() => {
            navigate(-1);
          }}
          variant="text"
        >
          <Typography component="span">{`< Go back to ${workflow?.name} Detail`}</Typography>
        </Button>
      </Grid>
      <Grid item xs={2} direction="column">
        <Paper>
          <Container sx={{ paddingTop: 2 }}>
            <Typography variant="h6" component="h2">
              Pieces :
            </Typography>
            <List>
              {data?.data.map((task, idx) => (
                <>
                  <ListItem
                    key={task.task_id}
                    disablePadding
                    sx={{ maxHeight: "60px", overflow: "hidden" }}
                  >
                    <ListItemButton
                      disableGutters
                      onClick={() => {
                        handleClickScroll(task.task_id);
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                        primary={
                          <Tooltip title={task.piece_name} placement="top">
                            <span>{task.piece_name}</span>
                          </Tooltip>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {idx !== data?.data.length - 1 ? <Divider /> : null}
                </>
              ))}
            </List>
            <Grid
              container
              sx={{ width: "100%" }}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <DownloadAsPDF contentId="DownloadAsPDF" />{" "}
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Grid>
      <Grid item xs={isPrint ? 12 : 10}>
        <PaperA4 id="DownloadAsPDF">
          <Grid
            container
            sx={{ width: "100%" }}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <Grid
              container
              item
              xs={12}
              alignItems="center"
              justifyContent="center"
              sx={{ marginTop: 10 }}
              direction="column"
            >
              <Grid item xs={12} marginLeft={2}>
                <Container>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{ margin: 0, fontSize: 36 }}
                  >
                    Workflow: {workflow?.name}
                  </Typography>
                </Container>
              </Grid>
              <Grid item xs={12} marginLeft={2} marginBottom={16}>
                <Container>
                  <Typography
                    variant="h2"
                    display="block"
                    gutterBottom
                    sx={{ margin: 0 }}
                  >
                    Pieces Results
                  </Typography>
                </Container>
              </Grid>

              <Grid item xs={12} alignSelf="flex-end" marginRight={2}>
                <Container
                  sx={{
                    marginRight: 0,
                    paddingRight: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  {startDate ? (
                    <Typography variant="caption" display="block" gutterBottom>
                      <span style={{ fontWeight: "bold" }}>
                        Workflow start date:
                      </span>
                      {startDate}{" "}
                    </Typography>
                  ) : null}
                  {endDate ? (
                    <Typography variant="caption" display="block" gutterBottom>
                      <span style={{ fontWeight: "bold" }}>
                        Workflow end date:
                      </span>{" "}
                      {endDate}{" "}
                    </Typography>
                  ) : null}
                  {duration ? (
                    <Typography variant="caption" display="block" gutterBottom>
                      <span style={{ fontWeight: "bold" }}>
                        Workflow total duration:
                      </span>{" "}
                      {duration}{" "}
                    </Typography>
                  ) : null}
                </Container>
              </Grid>
            </Grid>

            {data?.data.map((d, i) => (
              <PieceReport
                id={d.task_id}
                key={`piece-report-${i}`}
                taskData={
                  {
                    pieceName: d.piece_name,
                    ...d,
                  } as any
                }
              />
            ))}

            <Grid item xs={12} marginBottom={8}></Grid>
          </Grid>
        </PaperA4>
      </Grid>
    </Grid>
  );
};
