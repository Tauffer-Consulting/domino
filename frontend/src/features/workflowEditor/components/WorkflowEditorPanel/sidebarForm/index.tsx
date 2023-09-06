import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Drawer,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { type IWorkflowPieceData } from "features/workflowEditor/context/types";
import { useWorkflowsEditor } from "features/workflowEditor/context/workflowsEditor";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "utils";
import * as yup from "yup";

import ContainerResourceForm, {
  ContainerResourceFormSchema,
} from "./containerResourceForm";
import PieceForm from "./pieceForm";
import { createInputsSchemaValidation } from "./pieceForm/validation";
import StorageForm, { storageFormSchema } from "./storageForm";

interface ISidebarPieceFormProps {
  formId: string;
  schema: InputSchema;
  title: string;
  open: boolean;
  onClose: (event: any) => void;
}

const SidebarPieceForm: React.FC<ISidebarPieceFormProps> = (props) => {
  const { schema, formId, open, onClose, title } = props;

  const {
    setForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesOutputSchema,
    clearDownstreamDataById,
  } = useWorkflowsEditor();

  const SidebarPieceFormSchema = useMemo(() => {
    return yup.object().shape({
      storage: storageFormSchema,
      containerResources: ContainerResourceFormSchema,
      inputs: createInputsSchemaValidation(schema),
    });
  }, [schema]);

  const resolver = yupResolver(SidebarPieceFormSchema);

  const [formLoaded, setFormLoaded] = useState(false);

  const methods = useForm({
    resolver,
    mode: "onChange",
  });
  const { trigger, reset } = methods;
  const data = methods.watch();

  const loadData = useCallback(async () => {
    setFormLoaded(false);
    const data = await fetchForageWorkflowPiecesDataById(formId);
    if (data) {
      reset(data); // put forage data on form if exist
    } else {
      reset();
    }
    void trigger();
    setFormLoaded(true);
  }, [formId, fetchForageWorkflowPiecesDataById, reset, trigger]);

  const updateOutputSchema = useCallback(async () => {
    if (schema?.properties) {
      const outputSchemaProperty = Object.keys(schema.properties).find(
        (key) => {
          const inputSchema = schema.properties[key];
          return (
            "items" in inputSchema &&
            "$ref" in inputSchema.items &&
            inputSchema.items.$ref === "#/definitions/OutputModifierModel"
          );
        },
      );

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

        await setForageWorkflowPiecesOutputSchema(formId, newProperties);
        await clearDownstreamDataById(formId);
      }
    }
  }, [
    schema,
    data.inputs,
    setForageWorkflowPiecesOutputSchema,
    formId,
    clearDownstreamDataById,
  ]);

  const saveData = useCallback(async () => {
    if (formId && open) {
      await setForageWorkflowPiecesData(formId, data as IWorkflowPieceData);
      await updateOutputSchema();
    }
  }, [formId, open, setForageWorkflowPiecesData, data, updateOutputSchema]);

  // load forage
  useEffect(() => {
    if (open) {
      void loadData();
    } else {
      reset();
    }
  }, [open, reset, loadData]);

  // save on forage
  useEffect(() => {
    void saveData();
  }, [saveData]);

  return (
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
      BackdropProps={{ style: { backgroundColor: "transparent" } }}
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
        </Typography>

        <Grid container>
          <div style={{ display: "flex", flexDirection: "column" }}>
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
                      <PieceForm formId={formId} schema={schema} />
                    </Grid>

                    <div style={{ marginBottom: "50px" }} />

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
                  </Grid>
                </FormProvider>
              )}
            </Grid>
          </div>
        </Grid>
        <div style={{ marginBottom: "70px" }} />
      </div>
    </Drawer>
  );
};

export default SidebarPieceForm;
