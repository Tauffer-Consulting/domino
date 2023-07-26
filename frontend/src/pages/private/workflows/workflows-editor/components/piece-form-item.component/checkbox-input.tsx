import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import fetchFromObject from 'utils/fetch-from-object';

interface Props {
  name: `inputs.${string}.value` | `inputs.${string}.fromUpstream` | `inputs.${string}.fromUpstream.${string}`
  label?: string
  defaultChecked?: boolean
  disabled?: boolean
}

const CheckboxInput: React.FC<Props> = ({ label, name, defaultChecked = false, disabled = false }) => {
  const { control, formState: { errors } } = useFormContext<IWorkflowPieceData>()

  const error = fetchFromObject(errors, name)

  return (
    <>
      {label ?
        <FormControlLabel
          labelPlacement="start"
          label={label}
          control={
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={!!field.value}
                  disabled={disabled}
                />
              )}
            />}
        />
        :
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              checked={!!field.value}
              disabled={disabled}
            />
          )}
        />
      }
      <FormHelperText error>
        {error?.message}
      </FormHelperText>
    </>
  );
}

export default React.memo(CheckboxInput);
