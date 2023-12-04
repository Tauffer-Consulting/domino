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
import {
  type WorkflowsGalleryExamples,
  useAuthenticatedGetWorkflowsExamples,
} from "features/workflowEditor/api/workflowsExample";
import theme from "providers/theme.config";
import { forwardRef, type ForwardedRef, useState, useMemo } from "react";

import CloudSegmentationWorkflow from "../../utils/workflows/cloud_segmentation_workflow.json";
import DimensionalityReductionWorkflow from "../../utils/workflows/dimensionality_reduction.json";
import ImageFilterWorkflow from "../../utils/workflows/image_filter_workflow.json";
import NasaImageWorkflow from "../../utils/workflows/nasa_workflow.json";
import RandomForestClassifierWorkflow from "../../utils/workflows/random_forest_pipeline.json";
import YoutubeSummarizerWorkflow from "../../utils/workflows/youtube_summarizer.json";
import YoutubeLocalTranscript from "../../utils/workflows/youtube_transcript_local.json";

interface WorkflowGalleryModalRef extends ModalRef {}

interface WorkflowGalleryModalProps {
  confirmFn: (json: any) => void;
}

const USE_LOCAL_CARDS = true;

const localCardsContents = [
  {
    title: "Youtube Summarizer",
    description:
      "Sends the summary of the last BBCNews youtube channel video to an emails list. You must configure Secrets and Local storage to use it.",
    jsonFile: YoutubeSummarizerWorkflow,
    levelTag: "Advanced",
  },
  {
    title: "Image Filter Workflow",
    description: "A simple workflow that applies a filter to an image.",
    jsonFile: ImageFilterWorkflow,
    levelTag: "Beginner",
  },
  {
    title: "NASA Image Workflow",
    description: "A simple workflow that gets an image from NASA API.",
    jsonFile: NasaImageWorkflow,
    levelTag: "Beginner",
  },
  {
    title: "Dimensionality Reduction",
    description:
      "A workflow that applies dimensionality reduction to a dataset. To use it, you must use Shared Storage.",
    jsonFile: DimensionalityReductionWorkflow,
    levelTag: "Intermediate",
  },
  {
    title: "Random Forest Classifier",
    description:
      "A machine learning workflow to train a random forest and use it to predict a new data. To use it, you must use Shared Storage",
    jsonFile: RandomForestClassifierWorkflow,
    levelTag: "Intermediate",
  },
  {
    title: "Cloud Segmentation Workflow",
    description:
      "A workflow that uses OpenCV to create a cloud segmentation over a NASA earth image. To use it, you must use Shared Storage",
    jsonFile: CloudSegmentationWorkflow,
    levelTag: "Intermediate",
  },
  {
    title: "Youtube Transcript Local Model",
    description:
      "A workflow that uses a local whisper model with GPU access transcript a youtube video. To use it you must use Shared Storage",
    jsonFile: YoutubeLocalTranscript,
    levelTag: "Advanced",
  },
] as unknown as WorkflowsGalleryExamples;

const WorkflowExamplesGalleryModal = forwardRef(
  (
    props: WorkflowGalleryModalProps,
    ref: ForwardedRef<WorkflowGalleryModalRef>,
  ) => {
    const [selected, setSelected] = useState<number | null>(null);
    // only make requests if USE_LOCAL_CARDS=false
    const { data } = useAuthenticatedGetWorkflowsExamples(!USE_LOCAL_CARDS);

    const cardsContents = useMemo<WorkflowsGalleryExamples>(() => {
      if (USE_LOCAL_CARDS) {
        return localCardsContents;
      } else {
        return data ?? [];
      }
    }, [data, localCardsContents, USE_LOCAL_CARDS]);

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
                          fontWeight: "bold",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <div
                        style={{
                          position: "absolute",
                          top: "80px",
                          overflow: "hidden",
                          paddingRight: "15px",
                          textAlign: "justify",
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
