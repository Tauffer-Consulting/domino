import { Box, Grid } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import {
  disableCheckboxOptions,
  type UpstreamOptions,
} from "features/workflowEditor/utils";
import React, { useMemo } from "react";
import { useWatch } from "react-hook-form";

import { InputElement, ArrayInput, isArrayInput } from "./InputElement";

interface PieceFormItemProps {
  schema: Property;
  itemKey: string;
  definitions?: Definitions;
  upstreamOptions: UpstreamOptions;
}

const PieceFormItem: React.FC<PieceFormItemProps> = ({
  upstreamOptions,
  itemKey,
  schema,
  definitions,
}) => {
  const disableUpstream = useMemo(() => {
    return disableCheckboxOptions(schema);
  }, [schema]);

  const checkedFromUpstream = useWatch({
    name: `inputs.${itemKey}.fromUpstream`,
  });

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ paddingTop: "10px" }}
    >
      <Grid item xs={10}>
        {isArrayInput(schema) ? (
          <ArrayInput
            schema={schema}
            inputKey={`inputs.${itemKey}`}
            upstreamOptions={upstreamOptions}
            definitions={definitions}
            checkedFromUpstream={checkedFromUpstream}
          />
        ) : (
          <InputElement
            schema={schema}
            itemKey={`inputs.${itemKey}.value`}
            upstreamOptions={upstreamOptions}
            definitions={definitions}
            checkedFromUpstream={checkedFromUpstream}
          />
        )}
      </Grid>

      <Grid item xs={2} sx={{ display: "flex", justifyContent: "center" }}>
        <CheckboxInput
          name={`inputs.${itemKey}.fromUpstream`}
          disabled={disableUpstream}
        />
      </Grid>
    </Box>
  );
};

export default React.memo(PieceFormItem);
