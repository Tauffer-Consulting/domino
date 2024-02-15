import { Grid, Typography } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import NumberInput from "components/NumberInput";
import { type IContainerResourceFormData } from "features/workflowEditor/context/types";
import React from "react";
import * as yup from "yup";

// TODO check if these values make sense
const minAcceptedMemory = 128;
const minAcceptedCpu = 100;
const maxAcceptedMemory = 24000;
const maxAcceptedCpu = 10000;

export const defaultContainerResources: IContainerResourceFormData = {
  useGpu: false,
  memory: {
    min: 128,
    max: 128,
  },
  cpu: {
    min: 100,
    max: 100,
  },
};

export const ContainerResourceFormSchema: yup.ObjectSchema<IContainerResourceFormData> =
  yup.object().shape({
    cpu: yup.object().shape({
      min: yup
        .number()
        .integer()
        .typeError("Must must be a number")
        .max(maxAcceptedCpu)
        .min(minAcceptedCpu)
        .required(),
      max: yup
        .number()
        .integer()
        .typeError("Must be a number")
        .max(maxAcceptedCpu)
        .when("min", ([min], schema) => schema.min(min))
        .required(),
    }),
    memory: yup.object().shape({
      min: yup
        .number()
        .integer()
        .max(maxAcceptedMemory)
        .min(minAcceptedMemory)
        .required(),
      max: yup
        .number()
        .integer()
        .typeError("Must be a number")
        .max(maxAcceptedMemory)
        .when("min", ([min], schema) => schema.min(min))
        .required(),
    }),
    useGpu: yup.boolean().required(),
  });

const ContainerResourceForm: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} marginBottom={2}>
        <Typography
          variant="subtitle2"
          component="div"
          sx={{ flexGrow: 1, borderBottom: "1px solid;" }}
        >
          Container Resources
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <NumberInput
          label="CPU Min (m)"
          name="containerResources.cpu.min"
          required
          type="int"
          inputProps={{
            min: minAcceptedCpu,
            max: maxAcceptedCpu,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <NumberInput
          label="CPU Max (m)"
          name="containerResources.cpu.max"
          type="int"
          required
          inputProps={{
            min: minAcceptedCpu,
            max: maxAcceptedCpu,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <NumberInput
          label="Memory Min"
          name="containerResources.memory.min"
          type="int"
          required
          inputProps={{
            min: minAcceptedMemory,
            max: maxAcceptedMemory,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <NumberInput
          label="Memory Max"
          name="containerResources.memory.max"
          type="int"
          required
          inputProps={{
            min: minAcceptedMemory,
            max: maxAcceptedMemory,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <CheckboxInput name="containerResources.useGpu" label="Use GPU" />
      </Grid>
    </Grid>
  );
};

export default ContainerResourceForm;
