import { TextField } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  label: string
  itemKey: string
  defaultValue: number
  type: "float" | "int"
}

const NumberInput: React.FC<Props> = ({ itemKey, label, type="int", defaultValue}) => {
  const { register } = useFormContext<IWorkflowPieceData>()

  return (
    <TextField
      fullWidth
      variant="outlined"
      type="number"
      label={label}
      defaultValue={defaultValue}
      inputProps={{
        step: type==="int" ? 1 : 0.1,
      }}
      {...register(`inputs.${itemKey}.value`, {
        valueAsNumber: true
      })}
  />);
}

export default NumberInput;
