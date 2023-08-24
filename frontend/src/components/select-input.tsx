import React from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';
import { Controller, FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';
import { fetchFromObject } from 'utils';

type Props<T> = SelectProps & {
  name: Path<T>
  label: string
  options: string[] | { label: string, value: string }[]

  emptyValue: true
  defaultValue?: string
  registerOptions?: RegisterOptions<FieldValues, (string | undefined) & Path<T>> | undefined
} | SelectProps & {
  name: Path<T>
  label: string
  options: string[] | { label: string, value: string }[]

  emptyValue?: boolean
  registerOptions?: RegisterOptions<FieldValues>
}

function SelectInput<T extends FieldValues>({ options, label, name, emptyValue, registerOptions, ...rest }: Props<T>) {
  const { control, formState: { errors } } = useFormContext()

  const error = fetchFromObject(errors, name)

  return (
    <FormControl fullWidth>
      <InputLabel id={name}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            labelId={name}
            label={label}
            {...rest}
            {...field}
            onChange={(e)=>field.onChange(e.target.value as any)}
          >
            {emptyValue && <MenuItem value="" disabled>
              <em>None</em>
            </MenuItem>}
            {options.map((option) => {
              if (typeof option === "object") {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              }
              return (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              )
            })}
          </Select>
        )}
      />

      <FormHelperText error>
        {error?.message}
      </FormHelperText>
    </FormControl>);
}

export default SelectInput;
