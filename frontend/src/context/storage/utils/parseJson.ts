export function tryParseJSON<T = any>(jsonString: any) {
  try {
    const value = JSON.parse(jsonString);
    return value as T;
  } catch (e) {
    return jsonString;
  }
}

export function stringifyOrKepOriginal(json: any): string {
  if (typeof json === "string") {
    return json;
  } else {
    return JSON.stringify(json);
  }
}
