import { type Edge } from "reactflow";
import { generateTaskName, getUuidSlice, isEmpty } from "utils";

import { isArrayType } from "../components/Drawers/PieceFormDrawer/PieceForm/PieceFormItem/InputElement";

export interface Option {
  id: string;
  argument: string;
  value: string;
}

export type UpstreamOptions = Record<string, Option[]>;

export const getUpstreamOptions = (
  formId: string,
  schema: Schema,
  workflowPieces: Record<string, Piece>,
  workflowEdges: Edge[],
) => {
  const upstreamPieces: Array<Piece & { source: string }> = [];

  for (const ed of workflowEdges) {
    if (ed.target === formId) {
      upstreamPieces.push({
        ...workflowPieces[ed.source],
        source: ed.source,
      });
    }
  }

  if (!schema.properties || isEmpty(schema.properties)) {
    return {};
  }

  const upstreamOptions = generateOptions(schema.$defs, upstreamPieces);

  return upstreamOptions(schema);
};

function generateOptions(
  definitions: Definitions,
  upstreamPieces: Array<Piece & { source: string }>,
) {
  function generateOptionsForSchema(
    schema: Schema | Property | Definition,
  ): UpstreamOptions {
    const options: UpstreamOptions = {};
    const addOptions = (opts: Option[] | UpstreamOptions, key: string = "") => {
      if (Array.isArray(opts)) {
        const otherOpts = options[key] ?? [];

        options[key] = [...otherOpts, ...opts];
      } else {
        Object.entries(opts).forEach(([subKey, subOpts]) => {
          if (subKey) {
            options[`${key}.${subKey}`] = subOpts;
          } else {
            options[`${key}`] = subOpts;
          }
        });
      }
    };

    function processUpstreamPieces() {
      upstreamPieces.forEach(({ name, source, output_schema }) => {
        const outputSchema = output_schema.properties;

        const generatedOptions = Object.entries(outputSchema)
          .map(([key, prop]) => {
            if (compareTypes(schema, prop)) {
              return generateOption({
                pieceId: source,
                pieceName: name,
                propKey: key,
                propTitle: prop.title,
              });
            } else {
              return undefined;
            }
          })
          .filter((option) => !!option) as Option[];
        addOptions(generatedOptions);
      });
    }

    // TALVEZ SEJA SO AQUI ?
    if ("type" in schema && schema.type === "object") {
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([propKey, property]) => {
          if (property) {
            const option = generateOptionsForSchema(property);
            addOptions(option, propKey);
          }
        });
      }
    } else if (isArrayType(schema as Property)) {
      const arraySchema = schema as ArrayProperty | AnyOfArray;

      const items =
        "items" in arraySchema
          ? arraySchema.items
          : (arraySchema.anyOf.find((s) => s.type === "array") as ArrayProperty)
              ?.items;

      const propSchema =
        "$ref" in items ? getSchemaByRef(items, definitions) : items;
      addOptions(generateOptionsForSchema(propSchema), "__items");
      processUpstreamPieces();
    } else {
      processUpstreamPieces();
    }
    return options;
  }

  return generateOptionsForSchema;
}

interface GenerateOptionProps {
  pieceId: string;
  pieceName: string;
  propTitle: string;
  propKey: string;
}

function generateOption({
  pieceId,
  pieceName,
  propTitle,
  propKey,
}: GenerateOptionProps) {
  const value = `${pieceName} (${getUuidSlice(pieceId)}) - ${propTitle}`;
  const argument = propKey;
  const id = generateTaskName(pieceName, pieceId);
  return { id, argument, value };
}

function getSchemaByRef(ref: Reference, definitions: Definitions) {
  return definitions[ref.$ref.split("/").pop() as string];
}

function compareTypes(schema: Schema | Property | Definition, prop: Property) {
  function compare(
    s: Schema | Property | Definition,
    p: Schema | Property | Definition,
  ) {
    if ("format" in s || "format" in p) {
      return (s as StringProperty)?.format === (p as StringProperty)?.format;
    } else if ("type" in s && "type" in p) {
      return s.type === p.type;
    }
    return false;
  }

  if ("type" in schema && "type" in prop) {
    return compare(schema, prop);
  } else if ("anyOf" in schema && "type" in prop) {
    return schema.anyOf.some((s) => compare(s as any, prop));
  } else if ("type" in schema && "anyOf" in prop) {
    return prop.anyOf.some((p) => compare(schema, p as any));
  } else if ("anyOf" in schema && "anyOf" in prop) {
    // Verify if there is any type equal in the two arrays
    return schema.anyOf.some((s) =>
      prop.anyOf.some((p) => {
        if (p.type === "null" || s.type === "null") {
          return false;
        }
        return compare(s as any, p as any);
      }),
    );
  } else {
    return false;
  }
}
