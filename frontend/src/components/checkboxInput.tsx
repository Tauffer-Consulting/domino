import { Checkbox, FormControlLabel, FormHelperText } from "@mui/material";
import React from "react";
import {
  useFormContext,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { fetchFromObject } from "utils";

interface Props<T> {
  name: Path<T>;
  label?: string;
  disabled?: boolean;
}

function CheckboxInput<T extends FieldValues>({
  label,
  name,
  disabled = false,
}: Props<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = fetchFromObject(errors, name);

  return (
    <>
      {label ? (
        <FormControlLabel
          labelPlacement="start"
          label={label}
          control={
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={!!field.value}
                  disabled={disabled}
                />
              )}
            />
          }
        />
      ) : (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox {...field} checked={!!field.value} disabled={disabled} />
          )}
        />
      )}
      <FormHelperText error>{error?.message}</FormHelperText>
    </>
  );
}

export default CheckboxInput;
