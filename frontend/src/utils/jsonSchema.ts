// Extract default values from Schema
export const extractDefaultValues = (schema: any, output: any | null = null) => {
  output = output === null ? {} : output

  if (schema) {
    const properties = schema['properties']
    for (const [key, value] of Object.entries<any>(properties)) {
      if ('default' in value) {
        output[key] = value['default']
      } else if ('properties' in value) {
        output[key] = extractDefaultValues(value, output[key])
      }
    }
  }

  return output
}
