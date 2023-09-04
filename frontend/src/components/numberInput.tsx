import { TextField, type TextFieldProps } from "@mui/material";
import React, { useMemo } from "react";
import {
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";
import { fetchFromObject } from "utils";

type Props<T> = Omit<TextFieldProps, "variant"> & {
  label: string;
  name: Path<T>;
  defaultValue?: number;
  type: "float" | "int";
  registerOptions?: RegisterOptions<FieldValues>;
};

function NumberInput<T extends FieldValues>({
  name,
  label,
  type = "int",
  defaultValue = 0,
  inputProps,
  registerOptions,
  ...rest
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = fetchFromObject(errors, name);

  const options = useMemo<RegisterOptions<FieldValues>>(() => {
    if (registerOptions) {
      return {
        ...registerOptions,
        valueAsNumber: true,
      } as unknown as RegisterOptions<FieldValues>;
    }
    return {
      valueAsNumber: true,
    } as unknown as RegisterOptions<FieldValues>;
  }, [registerOptions]);

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
        ...inputProps,
        step: type === "int" ? 1 : 0.1,
      }}
      {...rest}
      {...register(name, options)}
    />
  );
}

export default NumberInput;
