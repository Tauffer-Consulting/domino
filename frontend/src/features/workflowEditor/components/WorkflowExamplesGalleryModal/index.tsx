import {
  Drawer,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  Dialog,
} from "@mui/material";
import { Modal, type ModalRef } from "components/Modal";
import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
} from "react";

const WorkflowExamplesGalleryModal = forwardRef(
  (props: any, ref: ForwardedRef<any>) => {
    const cardsContents = [
      {
        title: "First card",
        description: "First description",
      },
      {
        title: "Second card",
        description: "Second description",
      },
    ];

    return (
      <Modal
        title="Example Workflows Gallery"
        content={
          <Grid container spacing={2}>
            {cardsContents.map((card, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography>{card.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        }
        ref={ref}
      />
    );
  },
);
WorkflowExamplesGalleryModal.displayName = "WorkflowExamplesGalleryModal";
export { WorkflowExamplesGalleryModal };
