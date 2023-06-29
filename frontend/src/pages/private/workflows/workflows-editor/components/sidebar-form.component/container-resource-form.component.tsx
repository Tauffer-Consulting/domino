import React from "react";
import {
  Grid,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'

import * as yup from "yup";
import { useForm } from "react-hook-form";
import useYupValidationResolver from "utils/validationResolver";

// TODO check if these values make sense
const minAcceptedMemory = 128
const minAcceptedCpu = 100
const maxAcceptedMemory = 12800
const maxAcceptedCpu = 10000

const defaultContainerResources = {
  useGpu: false,
  memoryMin: 128,
  memoryMax: 128,
  cpuMin: 100,
  cpuMax: 100
}

export const formSchema = yup.object().shape({
  cpuMin: yup.number().integer().max(maxAcceptedCpu).min(minAcceptedCpu).required(),
  cpuMax: yup.number().integer().max(maxAcceptedCpu).min(minAcceptedCpu).required(),
  memoryMin: yup.number().integer().max(maxAcceptedMemory).min(minAcceptedMemory).required(),
  memoryMax: yup.number().integer().max(maxAcceptedMemory).min(minAcceptedMemory).required(),
});

interface IContainerResourceFormData {
  useGpu: boolean,
  cpuMin: number,
  cpuMax: number
  memoryMin: number,
  memoryMax: number
}

interface IContainerResourceFormProps {
  onChange: (data: IContainerResourceFormData) => void
}

const ContainerResourceForm: React.FC<IContainerResourceFormProps> = ({ onChange }) => {

  const resolver = useYupValidationResolver(formSchema);
  const { register, watch, formState } = useForm<IContainerResourceFormData>({ resolver, mode: "onChange"});
  

  const data = watch()
  onChange(data)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Container Resources</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="CPU Min"
          type="number"
          defaultValue={defaultContainerResources.cpuMin}
          required
          fullWidth
          inputProps={{
            min: minAcceptedCpu,
            max: maxAcceptedCpu
          }}
          error={!!formState.errors.cpuMin?.message}
          helperText={formState.errors.cpuMin?.message}
          {...register("cpuMin")}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="CPU Max"
          type="number"
          defaultValue={defaultContainerResources.cpuMax}
          required
          fullWidth
          inputProps={{
            min: minAcceptedCpu,
            max: maxAcceptedCpu
          }}
          error={!!formState.errors.cpuMax?.message}
          helperText={formState.errors.cpuMax?.message}
          {...register("cpuMax")}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Memory Min"
          type="number"
          defaultValue={defaultContainerResources.memoryMin}
          required
          fullWidth
          inputProps={{
            min: minAcceptedMemory,
            max: maxAcceptedMemory
          }}
          error={!!formState.errors.memoryMin?.message}
          helperText={formState.errors.memoryMin?.message}
          {...register("memoryMin")}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Memory Max"
          type="number"
          defaultValue={defaultContainerResources.memoryMax}
          required
          fullWidth
          inputProps={{
            min: minAcceptedMemory,
            max: maxAcceptedMemory
          }}
          error={!!formState.errors.memoryMax?.message}
          helperText={formState.errors.memoryMax?.message}
          {...register("memoryMax")}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              {...register("useGpu")}
              defaultChecked={defaultContainerResources.useGpu}
            />
          }
          label="Use GPU"
        />
      </Grid>
    </Grid>
  )
}

export default ContainerResourceForm;