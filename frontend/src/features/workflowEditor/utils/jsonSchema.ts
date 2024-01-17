// Extract default values from Schema

import { isEmpty } from "utils";

import { defaultContainerResources } from "../components/SidebarForm/ContainerResourceForm";
import {
  type IContainerResourceFormData,
  type IWorkflowPieceData,
} from "../context/types";

import { getFromUpstream } from "./getFromUpstream";

export const extractDefaultInputValues = (pieceSchema: Piece) => {
  const schema = pieceSchema.input_schema.properties;
  const definitions = pieceSchema.input_schema.$defs;
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
          for (const [objKey, objValue] of Object.entries(element)) {
            const fromUpstream = getFromUpstream(
              schema[key],
              definitions,
              objKey,
            );

            newValue.fromUpstream = {
              ...newValue.fromUpstream,
              [objKey]: fromUpstream,
            };
            newValue.upstreamId = {
              ...newValue.upstreamId,
              [objKey]: "",
            };
            newValue.upstreamArgument = {
              ...newValue.upstreamArgument,
              [objKey]: "",
            };
            newValue.upstreamValue = {
              ...newValue.upstreamValue,
              [objKey]: "",
            };
            newValue.value = {
              ...newValue.value,
              [objKey]: objValue,
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
  schema: Schema,
  output: any | null = null,
) => {
  output = output === null ? {} : output;

  if (!isEmpty(schema) && "properties" in schema) {
    const properties = schema.properties;
    for (const [key, value] of Object.entries(properties)) {
      if ("from_upstream" in value && value.from_upstream === "always") {
        output[key] = "";
      }

      if ("default" in value) {
        output[key] = value.default;
      } else if ("properties" in value) {
        output[key] = extractDefaultValues(value as any, output[key]);
      } else {
        output[key] = "";
      }
    }
  }

  return output;
};

export const extractDefaultContainerResources = (
  cr?: Piece["container_resources"],
): IContainerResourceFormData => {
  if (cr && !isEmpty(cr) && "limits" in cr && "requests" in cr) {
    return {
      cpu: {
        max: Number(cr.limits.cpu),
        min: Number(cr.requests.cpu),
      },
      memory: {
        max: Number(cr.limits.memory),
        min: Number(cr.requests.memory),
      },
      useGpu: cr?.use_gpu ?? false,
    };
  } else {
    return defaultContainerResources;
  }
};
