import React from "react";
import {
  Grid,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'

import * as yup from "yup";
import { useFormContext } from "react-hook-form";
import { IContainerResourceFormData, IWorkflowPieceData } from "context/workflows/types";

// TODO check if these values make sense
const minAcceptedMemory = 128
const minAcceptedCpu = 100
const maxAcceptedMemory = 12800
const maxAcceptedCpu = 10000

export const defaultContainerResources: IContainerResourceFormData = {
  useGpu: false,
  memory: {
    min: 128,
    max: 128,
  },
  cpu: {
    min: 100,
    max: 100
  }
}

export const ContainerResourceFormSchema: yup.ObjectSchema<IContainerResourceFormData> = yup.object().shape({
  cpu: yup.object().shape({
    min: yup.number().integer().max(maxAcceptedCpu).min(minAcceptedCpu).required(),
    max: yup.number().integer().max(maxAcceptedCpu).min(minAcceptedCpu).required()
  }),
  memory: yup.object().shape({
    min: yup.number().integer().max(maxAcceptedMemory).min(minAcceptedMemory).required(),
    max: yup.number().integer().max(maxAcceptedMemory).min(minAcceptedMemory).required()
  }),
  useGpu: yup.boolean().required(),
});

const ContainerResourceForm: React.FC = () => {
  const { register, formState } = useFormContext<IWorkflowPieceData>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Container Resources</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="CPU Min"
          type="number"
          required
          fullWidth
          inputProps={{
            min: minAcceptedCpu,
            max: maxAcceptedCpu
          }}
          error={!!formState.errors.containerResources?.cpu?.min?.message}
          helperText={formState.errors.containerResources?.cpu?.min?.message}
          {...register("containerResources.cpu.min")}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="CPU Max"
          type="number"
          required
          fullWidth
          inputProps={{
            min: minAcceptedCpu,
            max: maxAcceptedCpu
          }}
          error={!!formState.errors.containerResources?.cpu?.max?.message}
          helperText={formState.errors.containerResources?.cpu?.max?.message}
          {...register(`containerResources.cpu.max`)}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Memory Min"
          type="number"
          required
          fullWidth
          inputProps={{
            min: minAcceptedMemory,
            max: maxAcceptedMemory
          }}
          error={!!formState.errors.containerResources?.memory?.min?.message}
          helperText={formState.errors.containerResources?.memory?.min?.message}
          {...register("containerResources.memory.min")}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Memory Max"
          type="number"
          required
          fullWidth
          inputProps={{
            min: minAcceptedMemory,
            max: maxAcceptedMemory
          }}
          error={!!formState.errors.containerResources?.memory?.max?.message}
          helperText={formState.errors.containerResources?.memory?.max?.message}
          {...register("containerResources.memory.max")}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("containerResources.useGpu")}
            />
          }
          label="Use GPU"
        />
      </Grid>
    </Grid>
  )
}

export default ContainerResourceForm;
