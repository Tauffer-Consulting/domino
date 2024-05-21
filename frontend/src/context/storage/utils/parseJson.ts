export function tryParseJSON<T = unknown>(jsonString: unknown) {
  try {
    const value = JSON.parse(jsonString as string);
    return value as T;
  } catch (e) {
    return jsonString as string;
  }
}

export function stringifyOrKepOriginal(json: any): string {
  if (typeof json === "string") {
    return json;
  } else {
    return JSON.stringify(json);
  }
}
