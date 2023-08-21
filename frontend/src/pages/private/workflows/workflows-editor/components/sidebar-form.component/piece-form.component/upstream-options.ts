import { generateTaskName, getUuidSlice } from "utils"

export type Option = {
  id: string,
  argument: string,
  value: string
}

export type ArrayOption = {
  array: Option[]
  items: Option[]
}

export type UpstreamOptions = Record<string, Option[] | ArrayOption>

const getInputType = (schema: Record<string, any>) => {
  let type = schema.format ? schema.format : schema.type
  if ('allOf' in schema || "oneOf" in schema || "anyOf" in schema) {
    type = 'enum'
  }
  return type as string
}

const getOptions = (upstreamPieces: Record<string, any>, type: string): Option[] | ArrayOption => {
  const options: Option[] = []

  Object.keys(upstreamPieces).forEach(upstreamId => {

    const upPieces = upstreamPieces[upstreamId]

    for (const upPiece of upPieces) {
      const upSchema = upPiece.output_schema.properties

      for (const property in upSchema) {

        const upType = getInputType(upSchema[property])

        if ((upType === type) || (upType==="string" && type==="object")) {
          const value = `${upPiece?.name} (${getUuidSlice(upPiece.id)}) - ${upSchema[property].title}`
          const upstreamArgument = property
          const taskName = generateTaskName(upPiece.name,upPiece.id)
          options.push({ id: taskName, argument: upstreamArgument, value })
        }
      }
    }
  })

  return options
}

export const getUpstreamOptions = (formId: string, schema: any, workflowPieces: any, workflowEdges: any): UpstreamOptions => {
  const upstreamPieces: Record<string, any[]> = {}
  const upstreamOptions: UpstreamOptions = {}

  for (const ed of workflowEdges) {
    if (ed.target === formId) {
      if (Array.isArray(upstreamPieces[formId])) {
        upstreamPieces[formId].push({...workflowPieces[ed.source], id: ed.source})
      } else {
        upstreamPieces[formId] = []
        upstreamPieces[formId].push({...workflowPieces[ed.source], id: ed.source})
      }
    }
  }

  Object.keys(schema.properties).forEach(key => {

    let currentSchema = schema.properties[key]
    const currentType = getInputType(currentSchema)

    if (currentType === "array") {

      let itemsSchema = currentSchema?.items;
      if (currentSchema?.items?.$ref) {
        const subItemSchemaName = currentSchema.items.$ref.split('/').pop();
        itemsSchema = schema.definitions?.[subItemSchemaName];
      }

      const itemsType = getInputType(itemsSchema)

      const array = getOptions(upstreamPieces, currentType)
      const items = getOptions(upstreamPieces, itemsType)

      upstreamOptions[key] = { array, items } as ArrayOption

    } else {

      const options = getOptions(upstreamPieces, currentType)

      upstreamOptions[key] = options

    }
  })

  return upstreamOptions
}
