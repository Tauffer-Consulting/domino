import { TextField } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  label: string
  name: `inputs.${string}`
  defaultValue?: string
}

const TextInput: React.FC<Props> = ({ name, label, defaultValue = "" }) => {
  const { register } = useFormContext<IWorkflowPieceData>()

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      defaultValue={defaultValue}
      {...register(name)}
    />);
}

export default React.memo(TextInput);
