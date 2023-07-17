import { TextField } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  label: string
  itemKey: string
  defaultValue?: string
}

const TextInput: React.FC<Props> = ({ itemKey, label, defaultValue =""}) => {
  const { register } = useFormContext<IWorkflowPieceData>()

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      defaultValue={defaultValue}
      {...register(`inputs.${itemKey}.value`)}
  />);
}

export default TextInput;
