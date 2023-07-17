import { Checkbox, FormControlLabel } from '@mui/material';
import { IWorkflowPieceData } from 'context/workflows/types';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  label: string
  itemKey: string
}

const CheckboxInput: React.FC<Props> = ({ itemKey, label}) => {
  const { control } = useFormContext<IWorkflowPieceData>()

  return <FormControlLabel
  control={
    <Controller
      name={`inputs.${itemKey}.value`}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...field}
          checked={!!field.value}
          onChange={(e) => field.onChange(!!e.target.checked)}
        />
      )}
    />
  }
  labelPlacement="start"
  label={label}
/>;
}

export default CheckboxInput;
