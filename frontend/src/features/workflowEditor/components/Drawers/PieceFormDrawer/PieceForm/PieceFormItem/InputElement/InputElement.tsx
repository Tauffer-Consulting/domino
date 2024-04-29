import CheckboxInput from "components/CheckboxInput";
import CodeEditorInput from "components/CodeEditorInput";
import DatetimeInput from "components/DatetimeInput";
import NumberInput from "components/NumberInput";
import TextAreaInput from "components/TextAreaInput";
import TextInput from "components/TextInput";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import { type UpstreamOptions } from "features/workflowEditor/utils";
import React, { useMemo } from "react";

import { EnumInput } from "./EnumInput";
import ObjectInputComponent from "./ObjectInput";
import SelectUpstreamInput from "./SelectUpstreamInput";
import {
  extractCodeEditorLanguage,
  getOptionalType,
  isBooleanType,
  isCodeEditorType,
  isDateOrTimeType,
  isEnumType,
  isIntegerType,
  isNumberType,
  isObjectType,
  isStringType,
  isTextAreaType,
} from "./utils";

export * from "./ArrayInput";

interface Props {
  schema: Property | EnumDefinition;
  itemKey:
    | `inputs.${string}.value`
    | `inputs.${string}.value.${number}`
    | `inputs.${string}.value.${number}.value.${string}`;
  upstreamOptions: UpstreamOptions;
  checkedFromUpstream: boolean | Record<string, boolean>;
  definitions?: Definitions;
  isItemArray?: boolean;
  isItemObject?: boolean;
}

const InputElement: React.FC<Props> = React.memo(
  ({
    schema,
    itemKey,
    upstreamOptions,
    checkedFromUpstream,
    definitions,
    isItemArray,
    isItemObject = false,
  }) => {
    const upstreamKey = useMemo(() => {
      if (!!isItemArray || !!isItemObject) {
        return itemKey
          .replace("inputs.", "")
          .replaceAll(".value", "")
          .replace(/\.[0-9]/, ".__items");
      }
      return itemKey.replace("inputs.", "").replaceAll(".value", "");
    }, [isItemArray, itemKey]);

    if (checkedFromUpstream === true) {
      const options = upstreamOptions[upstreamKey];
      const checkboxKey = isItemObject
        ? itemKey.replace(/(\.value)(?!.*\.value)/, ".upstreamValue")
        : itemKey.replace(/\.value$/, "");

      return (
        <SelectUpstreamInput
          name={checkboxKey as any}
          label={schema?.title}
          options={options ?? []}
          object={isItemObject}
        />
      );
    } else if (isEnumType(schema, definitions)) {
      return (
        <EnumInput
          schema={schema as EnumProperty}
          itemKey={isItemArray ? `${itemKey}.value` : itemKey}
          definitions={definitions!}
        />
      );
    } else if (isNumberType(schema) || isIntegerType(schema)) {
      const isInteger = isIntegerType(schema);

      return (
        <NumberInput<WorkflowPieceData>
          name={isItemArray ? `${itemKey}.value` : itemKey}
          type={isInteger ? "int" : "float"}
          label={schema.title}
          defaultValue={
            "default" in schema
              ? schema?.default ?? (isInteger ? 10 : 10.5)
              : isInteger
                ? 10
                : 10.5
          }
        />
      );
    } else if (isBooleanType(schema)) {
      return (
        <CheckboxInput<WorkflowPieceData>
          name={isItemArray ? `${itemKey}.value` : itemKey}
          label={schema.title}
        />
      );
    } else if (isDateOrTimeType(schema)) {
      const optionalType = getOptionalType(schema);
      return (
        <DatetimeInput<WorkflowPieceData>
          name={isItemArray ? `${itemKey}.value` : itemKey}
          label={schema.title}
          defaultValue={(schema as StringProperty)?.default}
          type={
            (schema as StringProperty)?.format ?? (optionalType as FormatType)
          }
        />
      );
    } else if (isCodeEditorType(schema)) {
      const language = extractCodeEditorLanguage(schema as StringProperty);
      return (
        <CodeEditorInput<WorkflowPieceData>
          name={isItemArray ? `${itemKey}.value` : itemKey}
          language={language}
          placeholder={`Enter your ${language} code here.`}
        />
      );
    } else if (isTextAreaType(schema)) {
      return (
        <TextAreaInput<WorkflowPieceData>
          variant="outlined"
          name={isItemArray ? `${itemKey}.value` : itemKey}
          label={schema.title}
        />
      );
    } else if (isStringType(schema)) {
      return (
        <TextInput<WorkflowPieceData>
          variant="outlined"
          name={isItemArray ? `${itemKey}.value` : itemKey}
          label={schema.title}
        />
      );
    } else if (
      isItemArray &&
      isObjectType(schema as unknown as ObjectDefinition)
    ) {
      return (
        <ObjectInputComponent
          fromUpstream={checkedFromUpstream as Record<string, boolean>}
          schema={schema as unknown as ObjectDefinition}
          inputKey={itemKey as `inputs.${string}.value.${number}`}
          upstreamOptions={upstreamOptions}
          definitions={definitions}
        />
      );
    } else {
      return (
        <div style={{ color: "red", fontWeight: "bold" }}>
          Unknown widget type for {schema.title}
        </div>
      );
    }
  },
);

InputElement.displayName = "InputElement";

export { InputElement };
