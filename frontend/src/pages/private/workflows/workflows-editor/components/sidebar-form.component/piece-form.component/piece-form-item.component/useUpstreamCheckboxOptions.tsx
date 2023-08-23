import { useMemo } from "react";
import { ArrayOption, Option } from "../upstream-options";

function getFromUpstream(schema: InputSchemaProperty): FromUpstream {
  if(schema?.from_upstream){
    return schema?.from_upstream
  }

  return "allowed"
}

export function useUpstreamCheckboxOptions(schema: InputSchemaProperty, upstreamOptions: Option[] | ArrayOption) {
  return useMemo(() => {
    let defaultChecked: boolean = false;
    let disable: boolean = false;
    const fromUpstream = getFromUpstream(schema)

    if (!(upstreamOptions as Option[])?.length && !(upstreamOptions as ArrayOption)?.array?.length ) {
      defaultChecked = false;
      disable = true;
      return [defaultChecked, disable]
    }

    if (fromUpstream === "allowed") {
      defaultChecked = false;
      disable = false;
    }

    if (fromUpstream === "always") {
      defaultChecked = true;
      disable = false;
    }

    if (fromUpstream === "never") {
      defaultChecked = false;
      disable = true;
    }

    if ("allOf" in schema && schema.allOf.length > 0){
      defaultChecked = false;
      disable = true;
    }

    return [defaultChecked, disable]
  }, [schema, upstreamOptions])
}
