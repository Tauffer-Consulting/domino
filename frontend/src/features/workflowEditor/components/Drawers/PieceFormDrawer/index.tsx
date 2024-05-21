import { environment } from "@config/environment.config";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";
import {
  Drawer,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useTheme,
} from "@mui/material";
import { useWorkflowsEditor } from "features/workflowEditor/context";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import { createInputsSchemaValidation } from "features/workflowEditor/utils/validation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "utils";
import * as yup from "yup";

import PieceDocsPopover from "../PiecesDrawer/pieceDocsPopover";

import ContainerResourceForm, {
  ContainerResourceFormSchema,
} from "./ContainerResourceForm";
import PieceForm from "./PieceForm";
import StorageForm, { storageFormSchema } from "./StorageForm";

interface ISidebarPieceFormProps {
  formId: string;
  piece: Piece;
  title: string;
  open: boolean;
  onClose: (event: any) => void;
}

export const PieceFormDrawer: React.FC<ISidebarPieceFormProps> = (props) => {
  const { piece, formId, open, onClose, title } = props;
  const theme = useTheme();
  const {
    setWorkflowPieceDataById,
    getWorkflowPieceDataById,
    setWorkflowPieceOutputSchema,
    clearDownstreamDataById,
  } = useWorkflowsEditor();

  const [popoverOpen, setPopoverOpen] = useState(false);

  const handlePopoverClose = useCallback(
    (_: React.MouseEvent<HTMLButtonElement>, reason: any) => {
      if (reason && reason === "backdropClick") return;
      setPopoverOpen(false);
    },
    [setPopoverOpen],
  );
  const handlePopoverOpen = useCallback(() => {
    setPopoverOpen(true);
  }, [setPopoverOpen]);

  const PieceFormSchema = useMemo(() => {
    const inputsSchema = createInputsSchemaValidation(piece.input_schema);
    return yup.object().shape({
      storage: storageFormSchema,
      containerResources: ContainerResourceFormSchema,
      inputs: inputsSchema,
    });
  }, [piece]);

  const resolver = yupResolver(PieceFormSchema);

  const [formLoaded, setFormLoaded] = useState(false);

  const methods = useForm({
    resolver,
    mode: "onChange",
  });
  const { trigger, reset } = methods;
  const data = useWatch({ control: methods.control });

  const loadData = useCallback(() => {
    setFormLoaded(false);
    const data = getWorkflowPieceDataById(formId);
    if (data) {
      reset(data); // put forage data on form if exist
    } else {
      reset();
    }
    void trigger();
    setFormLoaded(true);
  }, [formId, getWorkflowPieceDataById, reset, trigger]);

  const updateOutputSchema = useCallback(() => {
    if (piece.input_schema?.properties) {
      const outputSchemaProperty = Object.keys(
        piece.input_schema.properties,
      ).find((key) => {
        const inputSchema = piece.input_schema.properties[key];
        return (
          "items" in inputSchema &&
          "$ref" in inputSchema.items &&
          inputSchema.items.$ref === "#/$defs/OutputModifierModel"
        );
      });

      if (outputSchemaProperty && data?.inputs?.[outputSchemaProperty]?.value) {
        const formsData = data.inputs[outputSchemaProperty].value;
        const newProperties = formsData.reduce(
          (
            acc: any,
            cur: { value: { type: string; name: string; description: any } },
          ) => {
            let defaultValue: any = "";
            let newProperties = {};

            if (cur.value.type === "integer") {
              defaultValue = 1;
            } else if (cur.value.type === "float") {
              defaultValue = 1.1;
            } else if (cur.value.type === "boolean") {
              defaultValue = false;
            }

            if (cur.value.type === "array") {
              newProperties = {
                [cur.value.name]: {
                  items: {
                    type: "string",
                  },
                  description: cur.value.description,
                  title: cur.value.name,
                  type: cur.value.type,
                },
              };
            } else {
              newProperties = {
                [cur.value.name]: {
                  default: defaultValue,
                  description: cur.value.description,
                  title: cur.value.name,
                  type: cur.value.type,
                },
              };
            }
            return { ...acc, ...newProperties };
          },
          {},
        );

        setWorkflowPieceOutputSchema(formId, newProperties as Properties);
        clearDownstreamDataById(formId);
      }
    }
  }, [
    piece,
    data.inputs,
    setWorkflowPieceOutputSchema,
    formId,
    clearDownstreamDataById,
  ]);

  const saveData = useCallback(() => {
    if (formId && open) {
      setWorkflowPieceDataById(formId, data as WorkflowPieceData);
      updateOutputSchema();
    }
  }, [formId, open, setWorkflowPieceDataById, data, updateOutputSchema]);

  // load forage
  useEffect(() => {
    if (open) {
      loadData();
    } else {
      setFormLoaded(false);
      reset();
    }
  }, [open, reset, loadData]);

  // save on forage
  useEffect(() => {
    saveData();
  }, [saveData]);

  if (!formLoaded) {
    return null;
  }

  return (
    <>
      <PieceDocsPopover
        piece={piece}
        popoverOpen={popoverOpen}
        handlePopoverClose={handlePopoverClose}
      />
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            marginTop: "4rem",
            width: "33%",
            maxWidth: "500px",
            minWidth: "300px",
          },
        }}
        slotProps={{ backdrop: { style: { backgroundColor: "transparent" } } }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            minWidth: "300px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          <Typography
            variant="h5"
            component="h5"
            sx={{ marginTop: "20px", marginBottom: "20px" }}
          >
            {title}

            <IconButton sx={{ padding: 0 }} onClick={handlePopoverOpen}>
              <HelpIcon
                sx={{ height: "20px", color: theme.palette.primary.main }}
              />
            </IconButton>
          </Typography>

          <Grid container>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "100%",
              }}
            >
              <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
                <Grid item xs={10}>
                  <Typography
                    variant="subtitle2"
                    component="div"
                    sx={{ flexGrow: 1, borderBottom: "1px solid;" }}
                  >
                    Input Arguments
                  </Typography>
                </Grid>
                <Grid item xs={12 - 10}>
                  <Typography
                    variant="subtitle2"
                    component="div"
                    sx={{ flexGrow: 1, borderBottom: "1px solid;" }}
                  >
                    Upstream
                  </Typography>
                </Grid>
              </Grid>

              <Grid container sx={{ paddingBottom: "25px" }}>
                {formLoaded && (
                  <FormProvider {...methods}>
                    <Grid item xs={12} className="sidebar-jsonforms-grid">
                      <Grid item xs={12}>
                        <PieceForm
                          formId={formId}
                          schema={piece.input_schema}
                        />
                      </Grid>

                      <div style={{ marginBottom: "50px" }} />
                      {environment.DOMINO_DEPLOY_MODE !== "local-compose" && (
                        <Accordion
                          sx={{
                            "&.MuiAccordion-root:before": {
                              display: "none",
                            },
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography
                              variant="subtitle2"
                              component="div"
                              sx={{ flexGrow: 1, borderBottom: "1px solid;" }}
                            >
                              Advanced Options
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <StorageForm />
                            <div style={{ marginBottom: "50px" }} />
                            <ContainerResourceForm />
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </Grid>
                  </FormProvider>
                )}
              </Grid>
            </div>
          </Grid>
          <div style={{ marginBottom: "70px" }} />
        </div>
      </Drawer>
    </>
  );
};
