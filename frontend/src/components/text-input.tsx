import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';
import { fetchFromObject } from 'utils';

type Props<T> = Omit<TextFieldProps, "variant" | "type"> & {
  label: string
  name: Path<T>
  defaultValue?: string
  registerOptions?: RegisterOptions<FieldValues>
}

function TextInput<T extends FieldValues>({ name, label, defaultValue = "",registerOptions, ...rest }:Props<T>) {
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
      {...rest}
      {...register(name,registerOptions)}
    />);
}

export default TextInput;
