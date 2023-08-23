import { CSSProperties } from "react"

export { };

declare global {
  type InputSchemaProperties = import("./properties").InputSchemaProperties;
  type InputSchemaProperty = import("./properties").InputSchemaProperty;
  type SimpleInputSchemaProperties = import("./properties").SimpleInputSchemaProperties;
  type SimpleInputSchemaProperty = import("./properties").SimpleInputSchemaProperty;
  type FromUpstream = import("./properties").FromUpstream;

  type ObjectDefinition = {
    type: "object"

    title: string
    description: string

    properties: SimpleInputSchemaProperties
  }

  type EnumDefinition = {
    type: "string"

    title: string
    description: string

    enum: Array<string>
  }

  type Definition = ObjectDefinition | EnumDefinition

  type Definitions = Record<string, Definition>

  interface InputSchema {
    title: string
    description: string

    type: "object"

    properties: InputSchemaProperties
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
