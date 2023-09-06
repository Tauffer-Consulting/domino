/* eslint-disable @typescript-eslint/consistent-type-imports */
declare global {
  type Piece = import("./piece").Piece;
  type PieceSchema = import("./piece").PieceSchema;
  type Definitions = import("./piece").Definitions;
  type Definition = import("./piece").Definition;
  type ObjectDefinition = import("./piece").ObjectDefinition;
  type EnumDefinition = import("./piece").EnumDefinition;
  type SimpleInputSchemaProperty = import("./piece").SimpleInputSchemaProperty;
  type ArrayObjectProperty = import("./piece").ArrayObjectProperty;
  type InputSchemaProperty = import("./piece").InputSchemaProperty;
  type FromUpstream = import("./piece").FromUpstream;

  type PieceForageSchema = import("./piece").PieceForageSchema;
  type PiecesRepository = import("./piece").PiecesRepository;
  type PieceRepository = import("./piece").PieceRepository;
}

export {};
