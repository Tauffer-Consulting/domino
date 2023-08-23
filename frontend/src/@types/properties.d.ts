type Reference = { "$ref": `#/definitions/${string}` }
type FromUpstream = "always" | "never" | "allowed"

type DefaultPropertyProps = {
  title: string
  description: string
  from_upstream?: FromUpstream
}

type BooleanProperty = DefaultPropertyProps & {
  type: "boolean"
  default: boolean
}
type NumberProperty = DefaultPropertyProps & {
  type: "number" | "integer"
  default: number
  exclusiveMaximum?: number
  exclusiveMinimum?: number
}
type StringProperty = DefaultPropertyProps & {
  type: "string"
  default: string

  widget?: string
  format?: "date" | "time" | "date-time"
}
type EnumProperty = DefaultPropertyProps & {
  allOf: Array<Reference>
  default: string
}

export type SimpleInputSchemaProperty =
  | BooleanProperty
  | NumberProperty
  | StringProperty
  | EnumProperty

export type SimpleInputSchemaProperties = Record<string, SimpleInputSchemaProperty>

type ArrayStringProperty = DefaultPropertyProps & {
  type: "array"
  default: Array<string>
  items: {
    type: "string"

    widget?: string
    format?: "date" | "time" | "date-time"
  }
}

type ArrayNumberProperty = DefaultPropertyProps & {
  type: "array"
  default: Array<number>
  items: {
    type: "number" | "integer"
  }
}

type ArrayBooleanProperty = DefaultPropertyProps & {
  type: "array"
  default: Array<boolean>
  items: {
    type: "boolean"
  }
}

type ArrayObjectProperty = DefaultPropertyProps & {
  type: "array"
  items: Reference
}

export type InputSchemaProperty = SimpleInputSchemaProperty
  | ArrayStringProperty
  | ArrayNumberProperty
  | ArrayBooleanProperty
  | ArrayObjectProperty

export type InputSchemaProperties = Record<string, InputSchemaProperty>
