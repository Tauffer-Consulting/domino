import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import * as yup from 'yup'
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { IStorageFormData, IWorkflowPieceData, storageAccessModeType, storageAccessModes } from 'context/workflows/types';

export const storageFormSchema = yup.object().shape({
  storageAccessMode: yup.mixed().oneOf(Object.values(storageAccessModes)).required(),
});

export const defaultStorage: IStorageFormData = {
  storageAccessMode: storageAccessModes.None as storageAccessModeType
}

const StorageForm: React.FC = () => {
  const { formState, control } = useFormContext<IWorkflowPieceData>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1, borderBottom: "1px solid;" }}>Storage</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Storage Access Mode</InputLabel>
          <Controller
            name="storage.storageAccessMode"
            control={control}
            defaultValue="None"
            render={({ field }) => (
              <Select
                {...field}
                onChange={(event) =>
                  field.onChange(event.target.value as storageAccessModeType)
                }
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Read">Read</MenuItem>
                <MenuItem value="Read/Write">Read/Write</MenuItem>
              </Select>
            )}
          />


          <FormHelperText error>
            {formState.errors.storage?.storageAccessMode?.message}
          </FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default StorageForm;
