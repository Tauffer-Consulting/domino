import { Box, Grid } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import CodeEditorInput from "components/CodeEditorInput";
import DatetimeInput from "components/DatetimeInput";
import NumberInput from "components/NumberInput";
import SelectInput from "components/SelectInput";
import TextAreaInput from "components/TextAreaInput";
import TextInput from "components/TextInput";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import {
  type Option,
  type UpstreamOptions,
} from "features/workflowEditor/utils";
import React, { useMemo } from "react";
import { type Control, useWatch } from "react-hook-form";

import ArrayInput from "./arrayInput";
import { disableCheckboxOptions } from "./disableCheckboxOptions";
import SelectUpstreamInput from "./selectUpstreamInput";

interface PieceFormItemProps {
  formId: string;
  schema: Property;
  itemKey: string;
  control: Control<WorkflowPieceData, any>;
  definitions?: Definitions;
  upstreamOptions: UpstreamOptions;
}

const PieceFormItem: React.FC<PieceFormItemProps> = ({
  formId,
  upstreamOptions,
  itemKey,
  schema,
  definitions,
  control,
}) => {
  const disableUpstream = useMemo(() => {
    return disableCheckboxOptions(schema);
  }, [schema]);

  const checkedFromUpstream = useWatch({
    name: `inputs.${itemKey}.fromUpstream`,
  });

  let inputElement: React.ReactNode = null;

  let anyOfType = "";
  if ("anyOf" in schema && schema.anyOf.length === 2) {
    const hasNullType = schema.anyOf.some((item) => item.type === "null");
    if (hasNullType) {
      for (const itemSchema of schema.anyOf) {
        if (itemSchema.type !== "null") {
          anyOfType =
            "format" in itemSchema && itemSchema.format
              ? itemSchema.format
              : itemSchema.type;
        }
      }
    }
  }

  if (checkedFromUpstream) {
    const options: Option[] = upstreamOptions[itemKey] ?? [];
    inputElement = (
      <SelectUpstreamInput
        name={`inputs.${itemKey}`}
        label={schema?.title}
        options={options}
      />
    );
  } else if ("allOf" in schema && schema.allOf.length > 0) {
    const typeClass = schema.allOf[0].$ref.split("/").pop() as string;
    let enumOptions: string[] = [];

    if (definitions?.[typeClass] && definitions[typeClass].type === "string") {
      enumOptions = (definitions[typeClass] as EnumDefinition).enum;
    }

    inputElement = (
      <SelectInput<WorkflowPieceData>
        label={itemKey}
        emptyValue
        name={`inputs.${itemKey}.value`}
        options={enumOptions}
      />
    );
  } else if (
    ("type" in schema && schema.type === "number") ||
    anyOfType === "float"
  ) {
    inputElement = (
      <NumberInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        type="float"
        label={schema.title}
        defaultValue={schema?.default ?? 10.5}
      />
    );
  } else if (
    ("type" in schema && schema.type === "integer") ||
    anyOfType === "integer"
  ) {
    inputElement = (
      <NumberInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        type="int"
        label={schema.title}
        defaultValue={schema?.default ?? 10}
      />
    );
  } else if ("type" in schema && schema.type === "boolean") {
    inputElement = (
      <CheckboxInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
      />
    );
  } else if (
    ("type" in schema && schema.type === "array") ||
    anyOfType === "array"
  ) {
    inputElement = (
      <ArrayInput
        formId={formId}
        inputKey={itemKey}
        schema={schema}
        definitions={definitions}
        upstreamOptions={upstreamOptions}
        control={control}
      />
    );
  } else if (
    ("type" in schema &&
      "format" in schema &&
      schema.type === "string" &&
      schema.format === "date") ||
    anyOfType === "date"
  ) {
    inputElement = (
      <DatetimeInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="date"
      />
    );
  } else if (
    ("type" in schema &&
      "format" in schema &&
      schema.type === "string" &&
      schema.format === "time") ||
    anyOfType === "time"
  ) {
    inputElement = (
      <DatetimeInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="time"
      />
    );
  } else if (
    ("type" in schema &&
      "format" in schema &&
      schema.type === "string" &&
      schema.format === "date-time") ||
    anyOfType === "date-time"
  ) {
    inputElement = (
      <DatetimeInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="date-time"
      />
    );
  } else if (
    ("type" in schema &&
      "widget" in schema &&
      schema.type === "string" &&
      schema.widget?.includes("codeeditor")) ??
    ("widget" in schema &&
      schema.widget?.includes("codeeditor") &&
      anyOfType === "string")
  ) {
    const language = schema.widget.includes("codeeditor-")
      ? schema.widget.replace("codeeditor-", "")
      : "python";

    inputElement = (
      <CodeEditorInput<WorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        language={language}
        placeholder={`Enter your ${language} code here.`}
      />
    );
  } else if (
    ("type" in schema &&
      "widget" in schema &&
      schema.type === "string" &&
      schema.widget === "textarea") ||
    (anyOfType === "string" &&
      "widget" in schema &&
      schema?.widget === "textarea")
  ) {
    inputElement = (
      <TextAreaInput<WorkflowPieceData>
        variant="outlined"
        name={`inputs.${itemKey}.value`}
        label={schema.title}
      />
    );
  } else if (
    ("type" in schema && !("format" in schema) && schema.type === "string") ||
    anyOfType === "string"
  ) {
    inputElement = (
      <TextInput<WorkflowPieceData>
        variant="outlined"
        name={`inputs.${itemKey}.value`}
        label={schema.title}
      />
    );
  } else {
    inputElement = (
      <div style={{ color: "red", fontWeight: "bold" }}>
        Unknown widget type for {schema.title}
      </div>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ paddingTop: "10px" }}
    >
      <Grid item xs={10}>
        {inputElement}
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
