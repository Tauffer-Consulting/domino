export function fetchFromObject(obj: any, prop: string): any {
  if (typeof obj === "undefined") {
    return;
  }

  const index = prop.indexOf(".");
  if (index > -1) {
    const newObj = obj[prop.substring(0, index)];

    return fetchFromObject(newObj, prop.substr(index + 1));
  }

  return obj[prop];
}
