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
import YoutubeWorkflow from "../../utils/workflows/youtube_workflow.json";

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
          "This workflow allows you to download and summarize youtube audios, and send then to emails.",
        jsonFile: YoutubeWorkflow,
      },
      {
        title: "Simple Log Workflow",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ut laoreet turpis.",
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
                    height: "200px",
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
                      <Typography>{card.description}</Typography>
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
