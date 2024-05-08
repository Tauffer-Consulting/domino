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
  memory: 128,
  cpu: 100,
};

export const ContainerResourceFormSchema = yup.object().shape({
  cpu: yup
    .number()
    .integer()
    .transform((value) => (isNaN(value) ? undefined : value))
    .max(maxAcceptedCpu)
    .min(minAcceptedCpu)
    .required(),
  memory: yup
    .number()
    .integer()
    .max(maxAcceptedMemory)
    .min(minAcceptedMemory)
    .required(),
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
          label="Available CPU"
          name="containerResources.cpu"
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
          label="Available Memory"
          name="containerResources.memory"
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
