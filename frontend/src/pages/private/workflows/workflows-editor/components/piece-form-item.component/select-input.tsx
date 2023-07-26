import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { IWorkflowPieceData } from 'context/workflows/types';
import fetchFromObject from 'utils/fetch-from-object';

interface Props {
  label: string
  name: `inputs.${string}.value`
  defaultValue: string
  options: string[]
}

const SelectInput: React.FC<Props> = ({ options, label, name, defaultValue }) => {
  const { register, formState:{errors} } = useFormContext<IWorkflowPieceData>()

  const error = fetchFromObject(errors,name)

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
      <FormHelperText error>
        {error?.message}
      </FormHelperText>
    </FormControl>);
}

export default React.memo(SelectInput);
