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
import { IWorkflowPieceData } from "context/workflows/types";

// TODO check if these values make sense
const minAcceptedMemory = 128
const minAcceptedCpu = 100
const maxAcceptedMemory = 12800
const maxAcceptedCpu = 10000

export const defaultContainerResources = {
  useGpu: false,
  memoryMin: 128,
  memoryMax: 128,
  cpuMin: 100,
  cpuMax: 100
}

export const ContainerResourceFormSchema = yup.object().shape({
  cpuMin: yup.number().integer().max(maxAcceptedCpu).min(minAcceptedCpu).required(),
  cpuMax: yup.number().integer().max(maxAcceptedCpu).min(minAcceptedCpu).required(),
  memoryMin: yup.number().integer().max(maxAcceptedMemory).min(minAcceptedMemory).required(),
  memoryMax: yup.number().integer().max(maxAcceptedMemory).min(minAcceptedMemory).required(),
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
          error={!!formState.errors.containerResources?.cpuMin?.message}
          helperText={formState.errors.containerResources?.cpuMin?.message}
          {...register("containerResources.cpuMin")}
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
          error={!!formState.errors.containerResources?.cpuMax?.message}
          helperText={formState.errors.containerResources?.cpuMax?.message}
          {...register(`containerResources.${"cpuMax"}`)}
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
          error={!!formState.errors.containerResources?.memoryMin?.message}
          helperText={formState.errors.containerResources?.memoryMin?.message}
          {...register("containerResources.memoryMin")}
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
          error={!!formState.errors.containerResources?.memoryMax?.message}
          helperText={formState.errors.containerResources?.memoryMax?.message}
          {...register("containerResources.memoryMax")}
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