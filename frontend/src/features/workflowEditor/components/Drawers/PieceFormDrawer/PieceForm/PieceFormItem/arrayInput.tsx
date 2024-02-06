import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Card, CardContent, IconButton, Grid } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import CodeEditorInput from "components/CodeEditorInput";
import DatetimeInput from "components/DatetimeInput";
import NumberInput from "components/NumberInput";
import SelectInput from "components/SelectInput";
import TextInput from "components/TextInput";
import {
  type InputArray,
  type IWorkflowPieceData,
} from "features/workflowEditor/context/types";
import {
  type UpstreamOptions,
  getFromUpstream,
} from "features/workflowEditor/utils";
import React, { useCallback, useMemo, useState } from "react";
import {
  type Control,
  type FieldArrayWithId,
  useFieldArray,
  useWatch,
} from "react-hook-form";

import { disableCheckboxOptions } from "./disableCheckboxOptions";
import ObjectInputComponent from "./objectInput";
import SelectUpstreamInput from "./selectUpstreamInput";

interface ArrayInputItemProps {
  formId: string;
  inputKey: string;
  schema: any;
  control: Control<IWorkflowPieceData, any>;
  definitions?: any;
  upstreamOptions: UpstreamOptions;
}

const ArrayInput: React.FC<ArrayInputItemProps> = ({
  inputKey,
  schema,
  upstreamOptions,
  definitions,
  control,
}) => {
  const name: `inputs.${string}.value` = `inputs.${inputKey}.value`;
  const {
    fields: data,
    append,
    remove,
  } = useFieldArray({
    name,
    control,
  });
  const fields = data as unknown as Array<FieldArrayWithId<InputArray>>;
  const formsData = useWatch({ name });

  const [enumOptions, setEnumOptions] = useState<string[]>([]);

  if ("anyOf" in schema && schema.anyOf.length === 2) {
    const hasNullType = schema.anyOf.some((item: any) => item.type === "null");
    if (hasNullType) {
      const notNullAnyOf = schema.anyOf.find(
        (item: any) => item.type !== "null",
      );
      schema.items = notNullAnyOf.items;
    }
  }

  const subItemSchema = useMemo(() => {
    let subItemSchema: any = schema?.items;
    if (schema?.items?.$ref) {
      const subItemSchemaName = schema.items.$ref.split("/").pop();
      subItemSchema = definitions?.[subItemSchemaName];
    }
    return subItemSchema;
  }, [definitions, schema]);

  const disableUpstream = useMemo(() => {
    return disableCheckboxOptions(subItemSchema);
  }, [subItemSchema]);

  const isFromUpstream = useCallback(
    (index: number) => {
      return formsData?.[index]?.fromUpstream ?? false;
    },
    [formsData],
  );

  const elementType = useMemo(() => {
    if (subItemSchema?.allOf && subItemSchema.allOf.length > 0) {
      const typeClass = subItemSchema.allOf[0].$ref.split("/").pop();
      const valuesOptions: string[] = definitions?.[typeClass].enum;
      setEnumOptions(valuesOptions);
      return "SelectInput";
    } else if (subItemSchema?.type === "number" && !subItemSchema?.format) {
      return "NumberInput";
    } else if (subItemSchema?.type === "integer" && !subItemSchema?.format) {
      return "NumberInputInt";
    } else if (subItemSchema?.type === "boolean" && !subItemSchema?.format) {
      return "CheckboxInput";
    } else if (
      subItemSchema?.type === "string" &&
      !subItemSchema?.format &&
      !subItemSchema?.widget
    ) {
      return "TextInput";
    } else if (
      subItemSchema?.type === "string" &&
      subItemSchema?.format === "date"
    ) {
      return "DateInput";
    } else if (
      subItemSchema?.type === "string" &&
      subItemSchema?.format === "time"
    ) {
      return "TimeInput";
    } else if (
      subItemSchema?.type === "string" &&
      subItemSchema?.format === "date-time"
    ) {
      return "DatetimeInput";
    } else if (
      subItemSchema?.type === "string" &&
      subItemSchema?.widget.includes("codeeditor")
    ) {
      return "CodeEditorInput";
    } else if (subItemSchema?.type === "object") {
      return "ObjectInput";
    } else {
      return "Unknown";
    }
  }, [subItemSchema, definitions]);

  const handleAddInput = useCallback(() => {
    function empty(object: Record<string, any>, fromUpstream = false) {
      Object.keys(object).forEach(function (k) {
        if (object[k] && typeof object[k] === "object") {
          return empty(object[k]);
        }
        if (fromUpstream) {
          object[k] = getFromUpstream(schema, definitions, k);
        } else {
          object[k] = "";
        }
      });
      return object;
    }
    const defaultValue = schema.default === null ? "" : schema.default[0];
    const isObject = typeof defaultValue === "object";
    let defaultObj = {
      fromUpstream: getFromUpstream(schema),
      upstreamArgument: "",
      upstreamId: "",
      upstreamValue: "",
      value: "",
    } as unknown;

    if (isObject) {
      const emptyObjValue = empty({ ...defaultValue });
      const emptyObjFromUpstream = empty({ ...defaultValue }, true);
      defaultObj = {
        fromUpstream: emptyObjFromUpstream,
        upstreamArgument: emptyObjValue,
        upstreamId: emptyObjValue,
        upstreamValue: emptyObjValue,
        value: defaultValue,
      } as unknown;
    }

    append([defaultObj] as any);
  }, [append, definitions, schema]);

  return (
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

              {fromUpstream && elementType !== "ObjectInput" && (
                <Grid item xs={9}>
                  <SelectUpstreamInput
                    name={`${name}.${index}`}
                    label={schema?.title}
                    options={upstreamOptions[`${inputKey}.__items`] ?? []}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "SelectInput" && (
                <Grid item xs={9}>
                  <SelectInput
                    label={schema.title}
                    emptyValue
                    defaultValue={""}
                    name={`${name}.${index}.value`}
                    options={enumOptions}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "NumberInput" && (
                <Grid item xs={9}>
                  <NumberInput
                    name={`${name}.${index}.value`}
                    type="float"
                    label={schema.title}
                    defaultValue={subItemSchema?.default ?? 10.5}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "NumberInputInt" && (
                <Grid item xs={9}>
                  <NumberInput
                    name={`${name}.${index}.value`}
                    type="int"
                    label={schema.title}
                    defaultValue={subItemSchema?.default ?? 10}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "CheckboxInput" && (
                <Grid item xs={9}>
                  <CheckboxInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "TextInput" && (
                <Grid item xs={9}>
                  <TextInput
                    variant="outlined"
                    name={`${name}.${index}.value`}
                    label={schema.title}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "DateInput" && (
                <Grid item xs={9}>
                  <DatetimeInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                    type="date"
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "TimeInput" && (
                <Grid item xs={9}>
                  <DatetimeInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                    type="time"
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "DatetimeInput" && (
                <Grid item xs={9}>
                  <DatetimeInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                    type="date-time"
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "CodeEditorInput" && (
                <Grid item xs={9}>
                  <CodeEditorInput
                    language={
                      subItemSchema?.widget === "codeeditor"
                        ? "python"
                        : subItemSchema.widget.replace("codeeditor-", "")
                    }
                    name={`${name}.${index}.value`}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "Unknown" && (
                <Grid item xs={9}>
                  <div style={{ color: "red", fontWeight: "bold" }}>
                    Unknown widget type for {subItemSchema?.title}
                  </div>
                </Grid>
              )}

              {elementType !== "ObjectInput" && (
                <Grid item xs={1}>
                  <CheckboxInput
                    name={`${name}.${index}.fromUpstream`}
                    disabled={disableUpstream}
                  />
                </Grid>
              )}

              {elementType === "ObjectInput" && (
                <Grid item xs={11}>
                  <ObjectInputComponent
                    name={`${name}.${index}`}
                    inputKey={inputKey}
                    schema={schema}
                    definitions={definitions}
                    upstreamOptions={upstreamOptions}
                  />
                </Grid>
              )}
            </Grid>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default React.memo(ArrayInput);
