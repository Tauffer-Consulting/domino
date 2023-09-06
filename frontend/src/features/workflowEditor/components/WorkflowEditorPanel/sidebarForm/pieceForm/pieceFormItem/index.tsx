import { Box, Grid } from "@mui/material";
import CheckboxInput from "components/CheckboxInput";
import CodeEditorInput from "components/CodeEditorInput";
import DatetimeInput from "components/DatetimeInput";
import NumberInput from "components/NumberInput";
import SelectInput from "components/SelectInput";
import TextInput from "components/TextInput";
import { type IWorkflowPieceData } from "features/workflowEditor/context/types";
import React, { useMemo } from "react";
import { type Control, useWatch } from "react-hook-form";

import { type ArrayOption, type Option } from "../../pieceForm/upstreamOptions";

import ArrayInput from "./arrayInput";
import { disableCheckboxOptions } from "./disableCheckboxOptions";
import SelectUpstreamInput from "./selectUpstreamInput";

interface PieceFormItemProps {
  formId: string;
  schema: InputSchemaProperty;
  itemKey: string;
  control: Control<IWorkflowPieceData, any>;
  definitions?: Definitions;
  upstreamOptions: Option[] | ArrayOption;
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

  if (checkedFromUpstream) {
    let options: Option[] = [];
    if ("type" in schema && schema.type === "array") {
      options = (upstreamOptions as ArrayOption).array;
    } else {
      options = upstreamOptions as Option[];
    }

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
      <SelectInput<IWorkflowPieceData>
        label={itemKey}
        emptyValue
        name={`inputs.${itemKey}.value`}
        options={enumOptions}
      />
    );
  } else if (
    "type" in schema &&
    (schema.type === "number" || schema.type === "float")
  ) {
    inputElement = (
      <NumberInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        type="float"
        label={schema.title}
        defaultValue={schema?.default ?? 10.5}
      />
    );
  } else if ("type" in schema && schema.type === "integer") {
    inputElement = (
      <NumberInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        type="int"
        label={schema.title}
        defaultValue={schema?.default ?? 10}
      />
    );
  } else if ("type" in schema && schema.type === "boolean") {
    inputElement = (
      <CheckboxInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
      />
    );
  } else if ("type" in schema && schema.type === "array") {
    inputElement = (
      <ArrayInput
        formId={formId}
        inputKey={itemKey}
        schema={schema}
        definitions={definitions}
        upstreamOptions={upstreamOptions as ArrayOption}
        control={control}
      />
    );
  } else if (
    "type" in schema &&
    "format" in schema &&
    schema.type === "string" &&
    schema.format === "date"
  ) {
    inputElement = (
      <DatetimeInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="date"
      />
    );
  } else if (
    "type" in schema &&
    "format" in schema &&
    schema.type === "string" &&
    schema.format === "time"
  ) {
    inputElement = (
      <DatetimeInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="time"
      />
    );
  } else if (
    "type" in schema &&
    "format" in schema &&
    schema.type === "string" &&
    schema.format === "date-time"
  ) {
    inputElement = (
      <DatetimeInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="date-time"
      />
    );
  } else if (
    "type" in schema &&
    "widget" in schema &&
    schema.type === "string" &&
    schema.widget === "codeeditor"
  ) {
    inputElement = (
      <CodeEditorInput<IWorkflowPieceData> name={`inputs.${itemKey}.value`} />
    );
  } else if (
    "type" in schema &&
    !("format" in schema) &&
    schema.type === "string"
  ) {
    inputElement = (
      <TextInput<IWorkflowPieceData>
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
      <Grid item xs={12}>
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
