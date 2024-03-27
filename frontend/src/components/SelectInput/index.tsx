import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectProps,
} from "@mui/material";
import React from "react";
import {
  Controller,
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";
import { fetchFromObject } from "utils";

type Props<T> = SelectProps & {
  name: Path<T>;
  label: string;
  options: string[] | Array<{ label: string; value: string }>;

  defaultValue?: string;
  registerOptions?: RegisterOptions<
    FieldValues,
    (string | undefined) & Path<T>
  >;
};

function SelectInput<T extends FieldValues>({
  options,
  label,
  name,
  ...rest
}: Props<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = fetchFromObject(errors, name);

  return (
    <FormControl fullWidth>
      <InputLabel id={name} error={!!error}>
        {label}
      </InputLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            labelId={name}
            label={label}
            error={!!error}
            {...rest}
            {...field}
            onChange={(e) => {
              field.onChange(e.target.value as any);
            }}
          >
            <MenuItem value="" disabled>
              <em>None</em>
            </MenuItem>
            {options.map((option) => {
              if (typeof option === "object") {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                );
              }
              return (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              );
            })}
          </Select>
        )}
      />

      <FormHelperText error>{error?.message}</FormHelperText>
    </FormControl>
  );
}

export default SelectInput;
