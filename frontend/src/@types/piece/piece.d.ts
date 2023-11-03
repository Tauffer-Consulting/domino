/* eslint-disable @typescript-eslint/consistent-type-imports */
export type FromUpstream = import("./properties").FromUpstream;

export type InputSchemaProperty = import("./properties").InputSchemaProperty;
export type ArrayObjectProperty = import("./properties").ArrayObjectProperty;

export type SimpleInputSchemaProperty =
  import("./properties").SimpleInputSchemaProperty;

export interface EnumDefinition {
  title: string;
  description: string;
  type: "string";
  enum: string[];
}

export interface ObjectDefinition {
  title: string;
  description: string;
  type: "object";
  properties: Record<string, EnumDefinition | SimpleInputSchemaProperty>;
}

export type Definition = EnumDefinition | ObjectDefinition;

export type Definitions = Record<string, Definition>;

export type SchemaProperties = Record<string, InputSchemaProperty>;

export interface PieceSchema {
  title: string;
  description: string;

  type: "object";

  properties: SchemaProperties;
  $defs?: Definitions;
  definitions?: Definitions; // Support for older versions of JSON Schema
}

export interface Piece {
  id: number;
  name: string;
  description: string;

  repository_id: number;

  input_schema: PieceSchema;
  output_schema: PieceSchema;
  secrets_schema: PieceSchema | null;

  source_image: string;
  source_url: string | null;
  dependency: {
    docker_image: string | null;
    dockerfile: string | null;
    requirements_file: string | null;
  };

  style?: {
    label?: string;
    module?: string;

    nodeType?: string;
    nodeStyle?: CSSProperties;

    useIcon?: boolean;
    iconClassName?: string;
    iconStyle?: CSSProperties;
  };
}

export type PieceForageSchema = Record<string | number, Piece>;

export type PiecesRepository = Record<string | number, Piece[]>;

export interface PieceRepository {
  id: string;
  name: string;
  label: string;
  created_at: string;
  source: string;
  path: string;
  version: string;
  workspace_id: number;
}
