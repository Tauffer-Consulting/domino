import { Grid, useMediaQuery } from "@mui/material";
import { DownloadAsPDF } from "components/DownloadPDF";
import { useAuthenticatedGetWorkflowRunResultReport } from "features/myWorkflows/api";
import React from "react";
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

  return (
    <Grid
      container
      style={{
        height: isPrint ? "auto" : `88vh`,
        width: "100%",
        margin: 0,
      }}
    >
      <Grid item xs={3}>
        {isPrint ? null : <DownloadAsPDF contentId="DownloadAsPDF" />}
      </Grid>
      <Grid item xs={isPrint ? 12 : 9}>
        <PaperA4 id="DownloadAsPDF">
          <Grid container sx={{ width: "100%" }} direction="column">
            {data?.data.map((d, i) => (
              <PieceReport
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
