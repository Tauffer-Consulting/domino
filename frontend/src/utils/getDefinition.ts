export function getDefinition(
  schema: InputSchemaProperty | SimpleInputSchemaProperty | EnumDefinition,
  definitions: Definitions,
) {
  if ("items" in schema && "$ref" in schema.items) {
    const definitionName = schema.items.$ref.split("/").pop() as string;
    return definitions[definitionName];
  } else if ("allOf" in schema) {
    const definitionName = schema.allOf[0].$ref.split("/").pop() as string;
    return definitions[definitionName];
  } else if ("items" in schema) {
    return schema.items;
  } else {
    return schema;
  }
}
