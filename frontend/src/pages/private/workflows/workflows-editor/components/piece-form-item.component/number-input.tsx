import { TextField } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import fetchFromObject from 'utils/fetch-from-object';

interface Props {
  label: string
  name: `inputs.${string}.value`
  defaultValue: number
  type: "float" | "int"
}

const NumberInput: React.FC<Props> = ({ name, label, type = "int", defaultValue }) => {
  const { register, formState:{errors} } = useFormContext<IWorkflowPieceData>()

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

export default React.memo(NumberInput);
