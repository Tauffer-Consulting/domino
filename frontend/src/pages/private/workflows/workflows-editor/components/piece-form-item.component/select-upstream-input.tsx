import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Option } from '../piece-form.component/upstream-options';
import { IWorkflowPieceData } from 'context/workflows/types';

interface Props {
  label: string
  name: `inputs.${string}`
  options: Option[]
}

const SelectUpstreamInput: React.FC<Props> = ({ options, label, name }) => {
  const { getValues, setValue, control } = useFormContext<IWorkflowPieceData>()

  const handleSelectChange = useCallback((event: SelectChangeEvent<string | null>, onChange: (e: any) => void) => {
    const value = event.target.value
    const upstream = options.find(op => op?.value === value) as Option
    const data = getValues(name)
    setValue(name, {
      ...data,
      upstreamArgument: upstream.argument,
      upstreamId: upstream.id
    })
    onChange(event)
  }, [getValues, name, options, setValue]);


  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Controller
        control={control}
        name={`${name}.upstreamValue`}
        render={({ field }) => (
          <Select
            fullWidth
            defaultValue={""}
            {...field}
            onChange={event =>
              handleSelectChange(event, field.onChange)
            }
          >
            <MenuItem value="" disabled>
              <em>None</em>
            </MenuItem>
            {options && options.map(({ value }: Option) => (
              <MenuItem
                key={value}
                value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </FormControl>
  );
}

export default React.memo(SelectUpstreamInput);
