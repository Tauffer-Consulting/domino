import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import React from 'react';
import { useFormContext, Controller, FieldValues, Path } from 'react-hook-form';
import { fetchFromObject } from 'utils';

interface Props<T> {
  name: Path<T>
  label?: string
  defaultChecked?: boolean
  disabled?: boolean
}

function CheckboxInput<T extends FieldValues>({ label, name, defaultChecked = false, disabled = false }: Props<T>) {
  const { control, formState: { errors } } = useFormContext<T>()

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

export default CheckboxInput;
