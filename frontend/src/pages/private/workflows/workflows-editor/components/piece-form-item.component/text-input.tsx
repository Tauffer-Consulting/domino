import { TextField } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import fetchFromObject from 'utils/fetch-from-object';

interface Props {
  label: string
  name: `inputs.${string}`
  defaultValue?: string
}

const TextInput: React.FC<Props> = ({ name, label, defaultValue = "" }) => {
  const { register, formState:{errors} } = useFormContext<IWorkflowPieceData>()

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

export default React.memo(TextInput);
