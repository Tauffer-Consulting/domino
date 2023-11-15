import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
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
        levelTag: "Advanced",
      },
      {
        title: "Simple Log Workflow",
        description:
          "A simple workflow that logs a message to the console. Useful as starting point for new users.",
        jsonFile: LogWorkflow,
        levelTag: "Beginner",
      },
    ];

    const levelTagMap: any = {
      Beginner: {
        color: "success",
      },
      Advanced: {
        color: "error",
      },
      Intermediate: {
        color: "warning",
      },
    };

    cardsContents.sort((a, b) => {
      const orderMap: any = {
        Beginner: 1,
        Intermediate: 2,
        Advanced: 3,
      };

      const levelA = orderMap[a.levelTag];
      const levelB = orderMap[b.levelTag];

      return levelA - levelB;
    });

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

                      <Typography
                        variant="h3"
                        sx={{
                          position: "absolute",
                          top: "20px",
                          left: "20px",
                          zIndex: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <div
                        style={{
                          position: "absolute",
                          top: "80px",
                          overflow: "hidden",
                        }}
                      >
                        <Typography>{card.description}</Typography>
                      </div>
                      <Chip
                        style={{ position: "absolute", bottom: "10px" }}
                        label={card.levelTag}
                        color={levelTagMap[card.levelTag].color}
                      />
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
