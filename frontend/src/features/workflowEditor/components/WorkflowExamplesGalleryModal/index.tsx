import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { Modal, type ModalRef } from "components/Modal";
import theme from "providers/theme.config";
import { forwardRef, type ForwardedRef, useState } from "react";

import LogWorkflow from "../../utils/workflows/simple_log_workflow.json";
import YoutubeSummarizerWorkflow from "../../utils/workflows/youtube_summarizer.json";

interface WorkflowGalleryModalRef extends ModalRef {}

interface WorkflowGalleryModalProps {
  confirmFn: (json: any) => void;
}

const WorkflowExamplesGalleryModal = forwardRef(
  (
    props: WorkflowGalleryModalProps,
    ref: ForwardedRef<WorkflowGalleryModalRef>,
  ) => {
    const [selected, setSelected] = useState<number | null>(null);

    const cardsContents = [
      {
        title: "Youtube Summarizer",
        description:
          "Sends the summary of the last BBCNews youtube channel video to an emails list. You must configure Secrets and Local storage to use it.",
        jsonFile: YoutubeSummarizerWorkflow,
      },
      {
        title: "Simple Log Workflow",
        description:
          "A simple workflow that logs a message to the console. Useful as starting point for new users.",
        jsonFile: LogWorkflow,
      },
    ];

    return (
      <Modal
        title="Example Workflows Gallery"
        maxWidth={"md"}
        fullWidth={true}
        content={
          <Grid container spacing={2}>
            {cardsContents.map((card, index) => (
              <Grid item key={index} xs={12} sm={4} md={4}>
                <Card
                  elevation={4}
                  sx={{
                    height: "250px",
                    backgroundColor: theme.palette.grey[100],
                  }}
                >
                  <CardActionArea
                    sx={{ height: "100%" }}
                    onClick={() => {
                      setSelected((s) => (s === index ? null : index));
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-evenly",
                        height: "100%",
                      }}
                    >
                      {selected === index && (
                        <CheckCircleIcon
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            color: theme.palette.success.light,
                            borderRadius: "50%",
                          }}
                        />
                      )}

                      <Typography variant="h3">{card.title}</Typography>
                      <div style={{ marginTop: "40px" }}>
                        <Typography>{card.description}</Typography>
                      </div>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        }
        confirmFn={() => {
          if (selected !== null) {
            props.confirmFn(cardsContents[selected].jsonFile);
          }
        }}
        cancelFn={() => {
          setSelected(null);
        }}
        ref={ref}
      />
    );
  },
);
WorkflowExamplesGalleryModal.displayName = "WorkflowExamplesGalleryModal";
export { WorkflowExamplesGalleryModal };
