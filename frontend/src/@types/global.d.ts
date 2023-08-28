import { CSSProperties } from "react"

export {};

declare global {
  type InputSchemaProperty = import("./properties").InputSchemaProperty;
  type ArrayObjectProperty = import("./properties").ArrayObjectProperty;

  type SimpleInputSchemaProperty = import("./properties").SimpleInputSchemaProperty;
  type FromUpstream = import("./properties").FromUpstream;

  type EnumDefinition = {
    title: string
    description: string
    type: "string"
    enum: Array<string>
  }

  type ObjectDefinition = {
    title: string
    description: string
    type: "object"
    properties: Record<string,EnumDefinition | SimpleInputSchemaProperty>
  }

  type Definition = EnumDefinition | ObjectDefinition

  type Definitions = Record<string, Definition>

  interface InputSchema {
    title: string
    description: string

    type: "object"

    properties: Record<string,InputSchemaProperty>
    definitions: Definitions
  }

  interface OutputSchema {

  }

  interface PieceSchema {
    id: number
    name: string
    description: string

    repository_id: number

    input_schema: InputSchema
    output_schema: OutputSchema

    secrets_schema: null
    source_image: string
    source_url: string
    dependency: {
      dockerfile: string | null
      requirements_file: string | null
    }

    style: {
      label: string
      module: string

      nodeType: string
      nodeStyle: CSSProperties

      useIcon: boolean
      iconClassName?: string
      iconStyle: CSSProperties

    }
  }
}
