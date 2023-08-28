import { ArrayOption, Option } from "../upstream-options";

function getFromUpstreamType(schema: InputSchemaProperty): FromUpstream {
  if (schema?.from_upstream) {
    return schema?.from_upstream
  }

  return "allowed"
}

export function disableCheckboxOptions(schema: InputSchemaProperty, upstreamOptions: Option[] | ArrayOption): boolean{
  let disable: boolean = false;
  const fromUpstream = getFromUpstreamType(schema)

  if (!(upstreamOptions as Option[])?.length && !(upstreamOptions as ArrayOption)?.array?.length) {
    disable = true;
    return disable
  }

  if (fromUpstream === "allowed") {
    disable = false;
  }

  if (fromUpstream === "always") {
    disable = false;
  }

  if (fromUpstream === "never") {
    disable = true;
  }

  if ("allOf" in schema && schema.allOf.length > 0) {
    disable = true;
  }

  return disable
}
