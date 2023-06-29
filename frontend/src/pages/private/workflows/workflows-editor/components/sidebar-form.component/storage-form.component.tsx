import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup'
import useYupValidationResolver from 'utils/validationResolver';
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';

const storageAccessModes = ['None', 'Read', 'Read/Write'] as const
type storageAccessModeType = typeof storageAccessModes

export const formSchema = yup.object().shape({
  storageAccessMode: yup.mixed().oneOf(storageAccessModes).required(),
});

interface IStorageFormData {
  storageAccessMode: storageAccessModeType,
}

interface IStorageFormProps {
  onChange: (data: IStorageFormData) => void
}


const StorageForm: React.FC<IStorageFormProps> = ({ onChange }) => {
  const resolver = useYupValidationResolver(formSchema);
  const { register, watch, formState } = useForm<IStorageFormData>({ resolver, mode: "onChange" });

  const data = watch()

  onChange(data)

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Storage</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Storage Access Mode</InputLabel>
          <Select
            defaultValue="None"
            error={!!formState.errors.storageAccessMode}
            required
            {...register("storageAccessMode")}
          >
            <MenuItem value="None">None</MenuItem>
            <MenuItem value="Read">Read</MenuItem>
            <MenuItem value="Read/Write">Read/Write</MenuItem>
          </Select>
          <FormHelperText error>
            {formState.errors.storageAccessMode?.message}
          </FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default StorageForm;