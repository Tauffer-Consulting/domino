function getFromUpstreamType(schema: InputSchemaProperty): FromUpstream {
  if (schema?.from_upstream) {
    return schema?.from_upstream;
  }

  return "allowed";
}

export function disableCheckboxOptions(schema: InputSchemaProperty): boolean {
  let disable: boolean = false;
  const fromUpstream = getFromUpstreamType(schema);

  if (fromUpstream === "allowed") {
    disable = false;
  }

  if (fromUpstream === "always") {
    disable = true;
  }

  if (fromUpstream === "never") {
    disable = true;
  }

  if ("allOf" in schema && schema.allOf.length > 0) {
    disable = true;
  }

  return disable;
}
