import { Grid } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import {
  disableCheckboxOptions,
  type UpstreamOptions,
} from "features/workflowEditor/utils";
import React, { useCallback } from "react";

import { InputElement } from "./InputElement";

interface Prop {
  // inputs.input_args.value.0
  inputKey: `inputs.${string}.value.${number}`;
  schema: ObjectDefinition;
  definitions?: Definitions;
  upstreamOptions: UpstreamOptions;
  fromUpstream: Record<string, boolean>;
}

const ObjectInputComponent: React.FC<Prop> = ({
  schema,
  inputKey,
  upstreamOptions,
  definitions,
  fromUpstream,
}) => {
  const isFromUpstream = useCallback(
    (key: string) => {
      const value = fromUpstream[key];
      return value;
    },
    [fromUpstream],
  );

  return (
    <>
      {Object.entries(schema.properties).map(([key, property]) => {
        const disableUpstream = disableCheckboxOptions(property as any);
        const checkedFromUpstream = isFromUpstream(key);

        return (
          <Grid
            key={key}
            container
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ marginBottom: 1 }}
          >
            <Grid item xs={10}>
              <InputElement
                isItemObject
                schema={property}
                itemKey={`${inputKey}.value.${key}`}
                checkedFromUpstream={checkedFromUpstream}
                upstreamOptions={upstreamOptions}
                definitions={definitions}
              />
            </Grid>
            <Grid item xs={2} sx={{ margin: 0 }}>
              <CheckboxInput
                name={`${inputKey}.fromUpstream.${key}`}
                disabled={disableUpstream}
              />
            </Grid>
          </Grid>
        );
      })}
    </>
  );
};

export default ObjectInputComponent;
