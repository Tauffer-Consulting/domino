import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Modal, type ModalRef } from "components/Modal";
import {
  useAuthenticatedGetWorkflowId,
  useAuthenticatedGetWorkflows,
} from "features/myWorkflows";
import { type IWorkflow } from "features/myWorkflows/types";
import theme from "providers/theme.config";
import { forwardRef, type ForwardedRef, useState, useMemo } from "react";

interface MyWorkflowGalleryModalRef extends ModalRef {}

interface MyWorkflowGalleryModalProps {
  confirmFn: (json: any) => void;
}

const MyWorkflowExamplesGalleryModal = forwardRef(
  (
    props: MyWorkflowGalleryModalProps,
    ref: ForwardedRef<MyWorkflowGalleryModalRef>,
  ) => {
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);

    const { data: workflows } = useAuthenticatedGetWorkflows(page, 9);

    const { data: workflow } = useAuthenticatedGetWorkflowId({
      id: selected !== null ? String(selected) : undefined,
    });

    const cardsContents = useMemo<IWorkflow[]>(
      () => workflows?.data ?? [],
      [workflows],
    );

    return (
      <Modal
        title="My Workflows Gallery"
        maxWidth={"md"}
        fullWidth={true}
        content={
          <Container>
            <Grid container justifyContent="center" spacing={2}>
              {cardsContents.map((card, index) => (
                <Grid item key={index} xs={12} sm={12} md={12}>
                  <Card
                    elevation={4}
                    sx={{
                      height: "60px",
                      backgroundColor: theme.palette.grey[100],
                    }}
                  >
                    <CardActionArea
                      sx={{ height: "100%" }}
                      onClick={() => {
                        setSelected((s) => (s === card.id ? null : card.id));
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        {selected === card.id && (
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
                        <Typography variant="h3">{card.name}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Divider sx={{ height: 20 }} />
              </Grid>
              <Grid xs={12} item>
                <Stack spacing={2} alignItems="center">
                  <Pagination
                    count={workflows?.metadata?.last_page}
                    onChange={(_, p) => {
                      setPage(p - 1);
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Container>
        }
        cancelFn={() => {
          setSelected(null);
        }}
        confirmFn={() => {
          props.confirmFn(workflow?.schema ?? {});
        }}
        ref={ref}
      />
    );
  },
);
MyWorkflowExamplesGalleryModal.displayName = "MyWorkflowExamplesGalleryModal";
export { MyWorkflowExamplesGalleryModal };
