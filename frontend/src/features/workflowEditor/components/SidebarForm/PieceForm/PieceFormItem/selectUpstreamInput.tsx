import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { type IWorkflowPieceData } from "features/workflowEditor/context/types";
import React, { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { fetchFromObject } from "utils";

import { type Option } from "../upstreamOptions";

type ObjectName = `inputs.${string}.value.${number}.upstreamValue.${string}`;
type Name = `inputs.${string}`;
type Props =
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
    };

const SelectUpstreamInput: React.FC<Props> = ({
  options,
  label,
  name,
  object,
}) => {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext<IWorkflowPieceData>();

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<string | null>, onChange: (e: any) => void) => {
      const value = event.target.value;
      const upstream = options.find((op) => op?.value === value) as Option;
      let nameArgument = "";
      let nameId = "";

      if (object) {
        nameArgument = name.replace(`.upstreamValue.`, ".upstreamArgument.");
        nameId = name.replace(`.upstreamValue.`, ".upstreamId.");
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
      <InputLabel error={!!error} id={name}>
        {label}
      </InputLabel>
      <Controller
        control={control}
        name={object ? name : `${name}.upstreamValue`}
        render={({ field }) => (
          <Select
            fullWidth
            defaultValue={""}
            labelId={name}
            label={label}
            error={!!error}
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
