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
  Typography,
  useMediaQuery,
} from "@mui/material";
// import { DownloadAsPDF } from "components/DownloadPDF";
import dayjs from "dayjs";
import {
  useAuthenticatedGetWorkflowId,
  useAuthenticatedGetWorkflowRunResultReport,
} from "features/myWorkflows/api";
import React, { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PaperA4 } from "./PaperA4";
import { PieceReport } from "./PieceReport";
import { ResultsReportSkeleton } from "./skeleton";

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

  const { startDate, endDate } = useMemo(() => {
    if (!data?.data) {
      return {
        startDate: null,
        endDate: null,
      };
    }

    const startDate = dayjs(data?.data[0]?.start_date).format(
      "YYYY-MM-DD HH:mm:ss",
    );
    const endDate = dayjs(data?.data[data?.data.length - 1]?.end_date).format(
      "YYYY-MM-DD HH:mm:ss",
    );
    return {
      startDate,
      endDate,
    };
  }, [data]);

  if (!data?.data) {
    return <ResultsReportSkeleton />;
  }

  return (
    <Grid
      container
      style={{
        height: isPrint ? "auto" : `88vh`,
        width: "100%",
        margin: 0,
      }}
    >
      <Grid item xs={2} direction="column">
        <Button
          variant="text"
          onClick={() => {
            navigate(-1);
          }}
        >
          {"< Go Back"}
        </Button>
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
                      onClick={() => {
                        handleClickScroll(task.task_id);
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText primary={`${task.piece_name}`} />
                    </ListItemButton>
                  </ListItem>
                  {idx !== data?.data.length - 1 ? <Divider /> : null}
                </>
              ))}
            </List>
          </Container>
        </Paper>
      </Grid>
      <Grid item xs={isPrint ? 12 : 9}>
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
              sx={{ marginY: 4 }}
              direction="column"
            >
              <Grid item xs={12}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{ margin: 0, fontSize: 36 }}
                >
                  {workflow?.name} tasks results
                </Typography>
              </Grid>

              <Grid item xs={12} alignSelf="flex-end">
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
          </Grid>
        </PaperA4>
      </Grid>
    </Grid>
  );
};
