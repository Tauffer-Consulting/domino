import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { IWorkflowPieceData } from 'context/workflows/types';

interface Props {
  label: string
  name: `inputs.${string}.value`
  defaultValue: string
  options: string[]
}

const SelectInput: React.FC<Props> = ({ options, label, name, defaultValue }) => {
  const { register } = useFormContext<IWorkflowPieceData>()

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        defaultValue={defaultValue ?? ""}
        {...register(name)}
      >
        <MenuItem value="" disabled>
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>);
}

export default React.memo(SelectInput);
