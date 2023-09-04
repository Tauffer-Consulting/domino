// Extract default values from Schema

import { type IWorkflowPieceData } from "context/workflows/types";

import { getFromUpstream } from "./getFromUpstream";

export const extractDefaultInputValues = (pieceSchema: PieceSchema) => {
  const schema = pieceSchema.input_schema.properties;
  const definitions = pieceSchema.input_schema.definitions;
  const defaultData = extractDefaultValues(pieceSchema.input_schema);

  const defaultInputs: IWorkflowPieceData["inputs"] = {};
  for (const key in defaultData) {
    const fromUpstream = getFromUpstream(schema[key]);

    let defaultValues = defaultData[key];
    if (Array.isArray(defaultData[key])) {
      const auxDefaultValues = [];
      for (const element of defaultData[key]) {
        let newValue: any = {};
        if (typeof element === "object") {
          newValue = {
            fromUpstream: {},
            upstreamId: {},
            upstreamArgument: {},
            upstreamValue: {},
            value: {},
          };
          for (const [_key, _value] of Object.entries(element)) {
            const fromUpstream = getFromUpstream(
              schema[key],
              definitions,
              _key,
            );

            newValue.fromUpstream = {
              ...newValue.fromUpstream,
              [_key]: fromUpstream,
            };
            newValue.upstreamId = {
              ...newValue.upstreamId,
              [_key]: "",
            };
            newValue.upstreamArgument = {
              ...newValue.upstreamArgument,
              [_key]: "",
            };
            newValue.upstreamValue = {
              ...newValue.upstreamValue,
              [_key]: "",
            };
            newValue.value = {
              ...newValue.value,
              [_key]: _value,
            };
          }
          auxDefaultValues.push(newValue);
        } else {
          newValue = {
            fromUpstream,
            upstreamId: "",
            upstreamArgument: "",
            upstreamValue: "",
            value: element,
          };
          auxDefaultValues.push(newValue);
        }
      }
      defaultValues = auxDefaultValues;
    }
    defaultInputs[key] = {
      fromUpstream,
      upstreamId: "",
      upstreamArgument: "",
      upstreamValue: "",
      value: defaultValues ?? null,
    };
  }
  return defaultInputs;
};

export const extractDefaultValues = (
  schema: InputSchema,
  output: any | null = null,
) => {
  output = output === null ? {} : output;

  if (schema) {
    const properties = schema.properties;
    for (const [key, value] of Object.entries(properties)) {
      if (value?.from_upstream === "always") {
        output[key] = "";
      }

      if ("default" in value) {
        output[key] = value.default;
      } else if ("properties" in value) {
        output[key] = extractDefaultValues(value as any, output[key]);
      }
    }
  }

  return output;
};
