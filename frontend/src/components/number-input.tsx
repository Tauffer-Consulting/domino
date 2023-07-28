import { TextField } from '@mui/material';
import React from 'react';
import { FieldValues, Path, useFormContext } from 'react-hook-form';
import fetchFromObject from 'utils/fetch-from-object';

interface Props<T> {
  label: string
  name: Path<T>
  defaultValue: number
  type: "float" | "int"
}

function NumberInput<T extends FieldValues>({ name, label, type = "int", defaultValue }:Props<T>) {
  const { register, formState:{errors} } = useFormContext()

  const error = fetchFromObject(errors,name)

  return (
    <TextField
      fullWidth
      variant="outlined"
      type="number"
      label={label}
      defaultValue={defaultValue}
      error={!!error?.message}
      helperText={error?.message}
      inputProps={{
        step: type === "int" ? 1 : 0.1,
      }}
      {...register(name, {
        valueAsNumber: true
      })}
    />);
}

export default NumberInput;
