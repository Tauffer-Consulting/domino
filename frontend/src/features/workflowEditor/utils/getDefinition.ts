export function getDefinition(definitions: Definitions, ref: Reference) {
  const typeClass = ref.$ref.split("/").pop()!;
  const definition = definitions?.[typeClass] ? definitions[typeClass] : null;
  return definition;
}
