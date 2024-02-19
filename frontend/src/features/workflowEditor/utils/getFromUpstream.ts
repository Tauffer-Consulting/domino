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
    const name = itemSchema.items.$ref.split("/").pop() as string;
    const definition = definitions[name];

    // Enum type cant be from upstream
    if (isEnum(definition)) {
      return false;
    } else if (definition.type === "object") {
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
