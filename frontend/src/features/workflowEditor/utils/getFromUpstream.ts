import { getDefinition } from "./getDefinition";

function isEnum(schema: Property | Definition): boolean {
  if ("allOf" in schema || "enum" in schema) {
    return true;
  }
  return false;
}

function getFromUpstream(itemSchema: Property): boolean;
function getFromUpstream(
  itemSchema: Property | EnumDefinition,
  definitions: Definitions,
  key: string,
): boolean;

function getFromUpstream(
  itemSchema: Property | EnumDefinition,
  definitions?: Definitions,
  key?: string,
): boolean {
  // Enum type cant be from upstream
  if (isEnum(itemSchema)) {
    return false;
  }

  if (definitions && "items" in itemSchema && "$ref" in itemSchema.items) {
    const definition = getDefinition(definitions, itemSchema.items);

    // Enum type cant be from upstream
    if (definition && isEnum(definition)) {
      return false;
    } else if (definition && definition.type === "object") {
      const schema = definition.properties[key as string];

      if ("allOf" in schema || "enum" in schema) {
        return false;
      }

      switch (schema?.from_upstream) {
        case "always":
          return true;

        case "allowed":
        case "never":
        default:
          return false;
      }
    }
  }

  if (
    "anyOf" in itemSchema &&
    itemSchema.anyOf.find((s) => s.type === "array" && "$ref" in s.items) &&
    definitions &&
    key
  ) {
    const anyOf = itemSchema.anyOf.find(
      (s) => s.type === "array" && "$ref" in s.items,
    ) as { items: Reference; type: "array" };

    const subProperty = getDefinition(
      definitions,
      anyOf.items,
    ) as ObjectDefinition;

    const property = subProperty?.properties[key];

    if ("from_upstream" in property) {
      switch (property?.from_upstream) {
        case "always":
          return true;

        case "allowed":
        case "never":
        default:
          return false;
      }
    } else {
      return false;
    }
  }

  switch ((itemSchema as Property)?.from_upstream) {
    case "always":
      return true;

    case "allowed":
    case "never":
    default:
      return false;
  }
}
export { getFromUpstream };
