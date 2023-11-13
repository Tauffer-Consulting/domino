import { TextField, type TextFieldProps } from "@mui/material";
import {
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";
import { fetchFromObject } from "utils";

type Props<T> = TextFieldProps & {
  label: string;
  name: Path<T>;
  defaultValue?: string;
  registerOptions?: RegisterOptions<FieldValues>;
};

function TextAreaInput<T extends FieldValues>({
  name,
  label,
  defaultValue = "",
  registerOptions,
  ...rest
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = fetchFromObject(errors, name);

  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      defaultValue={defaultValue}
      error={!!error?.message}
      helperText={error?.message}
      multiline
      rows={6}
      {...rest}
      {...register(name, registerOptions)}
    />
  );
}

export default TextAreaInput;
