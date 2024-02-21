import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Card, CardContent, IconButton, Grid } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import { type UpstreamOptions } from "features/workflowEditor/utils";
import React, { useCallback, useMemo } from "react";
import { useWatch, useFieldArray, useFormContext } from "react-hook-form";

import { disableCheckboxOptions } from "../../../../../../utils/disableCheckboxOptions";

import SelectUpstreamInput from "./SelectUpstreamInput";
import { extractArrayDefaultValue, isObjectType } from "./utils";

import { InputElement } from ".";

interface ArrayInputItemProps {
  inputKey: `inputs.${string}`;
  schema: ArrayProperty;
  definitions?: any;
  upstreamOptions: UpstreamOptions;
  checkedFromUpstream: boolean;
}

const ArrayInput: React.FC<ArrayInputItemProps> = React.memo(
  ({ inputKey, schema, upstreamOptions, definitions, checkedFromUpstream }) => {
    const name: `inputs.${string}.value` = `${inputKey}.value`;
    const { control } = useFormContext<WorkflowPieceData>();
    const { fields, append, remove } = useFieldArray({
      name,
      control,
    });
    const formsData = useWatch({ name });

    const subItemSchema = useMemo(() => {
      let subItemSchema: any = schema?.items;
      if ("$ref" in schema?.items) {
        const subItemSchemaName = schema.items.$ref.split("/").pop() as string;
        subItemSchema = definitions?.[subItemSchemaName];
      }
      return subItemSchema;
    }, [definitions, schema]);

    const handleAddInput = useCallback(() => {
      const defaultObj = extractArrayDefaultValue(schema, definitions);

      append([defaultObj] as any);
    }, [append, definitions, schema, fields]);

    const disableUpstream = useMemo(
      () => disableCheckboxOptions(subItemSchema),
      [subItemSchema],
    );

    const options = useMemo(() => upstreamOptions[inputKey], []);

    const isFromUpstream = useCallback(
      (index: number) => {
        return formsData?.[index]?.fromUpstream ?? false;
      },
      [formsData],
    );

    return (
      <>
        {checkedFromUpstream ? (
          <SelectUpstreamInput
            name={inputKey}
            label={schema?.title}
            options={options ?? []}
          />
        ) : (
          <Card sx={{ width: "100%", paddingTop: 0 }}>
            <div>
              <IconButton
                onClick={handleAddInput}
                aria-label="Add"
                sx={{ marginRight: "16px" }}
              >
                <AddIcon />
              </IconButton>
              {schema?.title}
            </div>
            <CardContent>
              {fields?.map((fieldWithId, index) => {
                const { id } = fieldWithId;
                const isObject = isObjectType(subItemSchema);
                const fromUpstream = isFromUpstream(index);
                return (
                  <Grid
                    key={id}
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mb: 1,
                      borderLeft: "solid 1px rgba(0,0,0,0.8)",
                      borderRadius: "6px",
                    }}
                  >
                    <Grid item xs={1}>
                      <IconButton
                        onClick={() => {
                          remove(index);
                        }}
                        aria-label="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                    <Grid item xs={10}>
                      <InputElement
                        isItemArray
                        schema={subItemSchema}
                        itemKey={`${inputKey}.value.${index}`}
                        upstreamOptions={upstreamOptions}
                        definitions={definitions}
                        checkedFromUpstream={fromUpstream}
                      />
                    </Grid>
                    {isObject ? null : (
                      <Grid item xs={1}>
                        <CheckboxInput
                          name={`${inputKey}.value.${index}.fromUpstream`}
                          disabled={disableUpstream}
                        />
                      </Grid>
                    )}
                  </Grid>
                );
              })}
            </CardContent>
          </Card>
        )}
      </>
    );
  },
);

ArrayInput.displayName = "ArrayInput";

export { ArrayInput };
