import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import { type Option } from "features/workflowEditor/utils";
import React, { useCallback } from "react";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { fetchFromObject } from "utils";

type ObjectName = `inputs.${string}.value.${number}.upstreamValue.${string}`;
type Name = `inputs.${string}`;
type Props = FieldValues &
  (
    | {
        label: string;
        name: Name;
        options: Option[];
        object?: false;
      }
    | {
        label: string;
        name: ObjectName;
        options: Option[];
        object: true;
      }
  );

const SelectUpstreamInput: React.FC<Props> = ({
  options,
  label,
  name,
  object,
  ...rest
}) => {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<WorkflowPieceData>();

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<string | null>, onChange: (e: any) => void) => {
      const value = event.target.value;
      const upstream = options.find((op) => op?.value === value)!;
      let nameArgument = "";
      let nameId = "";

      if (object) {
        nameArgument = name.replace(`upstreamValue`, ".upstreamArgument");
        nameId = name.replace(`upstreamValue`, ".upstreamId");
      } else {
        nameArgument = `${name}.upstreamArgument`;
        nameId = `${name}.upstreamId`;
      }

      setValue(
        nameArgument as `inputs.${string}.upstreamArgument`,
        upstream.argument,
      );
      setValue(nameId as `inputs.${string}.upstreamId`, upstream.id);
      onChange(event);
    },
    [name, object, options, setValue],
  );

  const error = fetchFromObject(
    errors,
    object ? name : `${name}.upstreamValue`,
  );

  return (
    <FormControl fullWidth>
      <InputLabel id={name} error={!!error}>
        {label}
      </InputLabel>
      <Controller
        name={object ? name : `${name}.upstreamValue`}
        control={control}
        render={({ field }) => (
          <Select
            labelId={name}
            label={label}
            error={!!error}
            {...rest}
            {...field}
            onChange={(event) => {
              handleSelectChange(event, field.onChange);
            }}
          >
            <MenuItem value="" disabled>
              <em>None</em>
            </MenuItem>
            {options?.map(({ value }: Option) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      <FormHelperText error>{error?.message}</FormHelperText>
    </FormControl>
  );
};

export default React.memo(SelectUpstreamInput);
