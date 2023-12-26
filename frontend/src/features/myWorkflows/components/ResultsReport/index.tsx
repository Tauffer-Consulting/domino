import LogoutIcon from "@mui/icons-material/Logout";
import {
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
import {
  useAuthenticatedGetWorkflowId,
  useAuthenticatedGetWorkflowRunResultReport,
} from "features/myWorkflows/api";
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";

import { PaperA4 } from "./PaperA4";
import { PieceReport } from "./PieceReport";

export const ResultsReport: React.FC = () => {
  const { id, runId } = useParams<{ id: string; runId: string }>();
  const { data } = useAuthenticatedGetWorkflowRunResultReport({
    workflowId: id,
    runId,
  });

  const isPrint = useMediaQuery("print");

  const handleClickScroll = useCallback((id: string) => {
    const element = document.getElementById(id);
    console.log(element);
    if (element) {
      // Find the PaperA4 element containing the target element
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const { data: workflow } = useAuthenticatedGetWorkflowId({
    id: id as string,
  });

  return (
    <Grid
      container
      style={{
        height: isPrint ? "auto" : `88vh`,
        width: "100%",
        margin: 0,
      }}
    >
      <Grid item xs={2}>
        <Paper>
          <Container sx={{ paddingTop: 2 }}>
            <Typography variant="h6" component="h2">
              Pieces :
            </Typography>

            <List>
              {data?.data.map((task) => (
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
                  <Divider />
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
            >
              <Typography variant="h1" component="h1" sx={{ margin: 0 }}>
                {workflow?.name} tasks results
              </Typography>
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
