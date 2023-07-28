import React from 'react';
import { TextField } from '@mui/material';
import { FieldValues, Path, useFormContext } from 'react-hook-form';
import fetchFromObject from 'utils/fetch-from-object';

interface Props<T> {
  label: string
  name: Path<T>
  defaultValue?: string
}

function TextInput<T extends FieldValues>({ name, label, defaultValue = "" }:Props<T>) {
  const { register, formState:{errors} } = useFormContext()

  const error = fetchFromObject(errors,name)

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      defaultValue={defaultValue}
      error={!!error?.message}
      helperText={error?.message}
      {...register(name)}
    />);
}

export default TextInput;
