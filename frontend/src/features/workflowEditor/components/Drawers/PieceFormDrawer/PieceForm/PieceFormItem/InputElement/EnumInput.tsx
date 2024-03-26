import SelectInput from "components/SelectInput";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import React from "react";

interface EnumInputProps {
  schema: EnumProperty;
  itemKey: `inputs.${string}`;
  definitions: Definitions;
}

export const EnumInput: React.FC<EnumInputProps> = ({
  schema,
  itemKey,
  definitions,
}) => {
  const typeClass = schema.allOf[0].$ref.split("/").pop() as string;
  const definition = definitions?.[typeClass] ? definitions[typeClass] : null;
  let enumOptions: string[] = [];

  if (definition && "enum" in definition) {
    enumOptions = definition.enum;
  }

  return (
    <SelectInput<WorkflowPieceData>
      label={definition?.title ?? itemKey.split(".").pop() ?? ""}
      name={itemKey}
      options={enumOptions}
    />
  );
};
