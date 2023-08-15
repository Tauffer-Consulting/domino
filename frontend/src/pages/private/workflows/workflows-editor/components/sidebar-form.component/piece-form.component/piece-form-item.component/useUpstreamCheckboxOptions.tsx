import { useMemo } from "react";
import { ArrayOption, Option } from "../upstream-options";

export function useUpstreamCheckboxOptions(schema: any, upstreamOptions: Option[] | ArrayOption) {
  return useMemo(() => {
    let defaultChecked: boolean = true;
    let disable: boolean = false;
    if (schema?.from_upstream === "never") {
      defaultChecked = false;
      disable = true;
    } else if (schema?.from_upstream === "always") {
      defaultChecked = true;
      disable = true;
    }

    if (schema?.allOf && schema.allOf.length > 0) {
      defaultChecked = true;
      disable = true;
    }

    if (!(upstreamOptions as Option[])?.length) {
      disable = true;
    }

    if ((upstreamOptions as ArrayOption)?.array?.length) {
      disable = false;
    }

    return [defaultChecked, disable]
  }, [schema, upstreamOptions])
}
