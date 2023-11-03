import { generateTaskName, getUuidSlice } from "utils";

export interface Option {
  id: string;
  argument: string;
  value: string;
}

export interface ArrayOption {
  array: Option[];
  items: Option[];
}

export type ComplexArrayOption = Record<string, ArrayOption>;

export type UpstreamOptions = Record<string, Option[] | ArrayOption>;

const getInputType = (schema: Record<string, any>) => {
  let type = schema.format ? schema.format : schema.type;
  if ("allOf" in schema || "oneOf" in schema) {
    type = "enum";
  } else if ("anyOf" in schema) {
    type = [];
    for (const item of schema.anyOf) {
      type.push(item.type);
    }
  }
  return type === "number" ? "float" : (type as string);
};

const getOptions = (
  upstreamPieces: Record<string, any>,
  type: string,
): Option[] | ArrayOption => {
  const options: Option[] = [];

  Object.keys(upstreamPieces).forEach((upstreamId) => {
    const upPieces = upstreamPieces[upstreamId];

    for (const upPiece of upPieces) {
      const upSchema = upPiece.output_schema.properties;

      for (const property in upSchema) {
        const upType = getInputType(upSchema[property]);

        if (
          upType === type ||
          (upType === "string" && type === "object") ||
          (Array.isArray(type) && type.includes(upType))
        ) {
          const value = `${upPiece?.name} (${getUuidSlice(upPiece.id)}) - ${
            upSchema[property].title
          }`;
          const upstreamArgument = property;
          const taskName = generateTaskName(upPiece.name, upPiece.id);
          options.push({ id: taskName, argument: upstreamArgument, value });
        }
      }
    }
  });

  return options;
};

export const getUpstreamOptions = (
  formId: string,
  schema: any,
  workflowPieces: any,
  workflowEdges: any,
): UpstreamOptions => {
  const upstreamPieces: Record<string, any[]> = {};
  const upstreamOptions: UpstreamOptions = {};

  for (const ed of workflowEdges) {
    if (ed.target === formId) {
      if (Array.isArray(upstreamPieces[formId])) {
        upstreamPieces[formId].push({
          ...workflowPieces[ed.source],
          id: ed.source,
        });
      } else {
        upstreamPieces[formId] = [];
        upstreamPieces[formId].push({
          ...workflowPieces[ed.source],
          id: ed.source,
        });
      }
    }
  }

  Object.keys(schema.properties).forEach((key) => {
    const currentSchema = schema.properties[key];
    const currentType = getInputType(currentSchema);

    if (currentType === "array") {
      let itemsSchema = currentSchema?.items;
      if (currentSchema?.items?.$ref) {
        const subItemSchemaName = currentSchema.items.$ref.split("/").pop();
        itemsSchema = schema.definitions?.[subItemSchemaName];
      }

      const array = getOptions(upstreamPieces, currentType);
      if (itemsSchema.type === "object") {
        const __data: any = {};
        Object.keys(itemsSchema.properties).forEach((subKey) => {
          const subSchema = itemsSchema.properties[subKey];
          const subType = getInputType(subSchema);
          const items = getOptions(upstreamPieces, subType);
          __data[subKey] = { array, items };
        });
        upstreamOptions[key] = __data;
      } else {
        const itemsType = getInputType(itemsSchema);
        const items = getOptions(upstreamPieces, itemsType);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        upstreamOptions[key] = { array, items } as ArrayOption;
      }
    } else {
      const options = getOptions(upstreamPieces, currentType);
      upstreamOptions[key] = options;
    }
  });

  return upstreamOptions;
};
