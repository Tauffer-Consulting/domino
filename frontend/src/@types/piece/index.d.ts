/* eslint-disable @typescript-eslint/consistent-type-imports */
declare global {
  type Piece = import("./piece").Piece;
  type PieceForageSchema = import("./piece").PieceForageSchema;
  type PiecesRepository = import("./piece").PiecesRepository;
  type Repository = import("./piece").Repository;

  type Schema = import("./schema").Schema;
  type Properties = import("./schema").Properties;
  type Property = import("./schema").Property;
  type FromUpstream = import("./schema").FromUpstream;
  type Definitions = import("./schema").Definitions;
  type ObjectDefinition = import("./schema").ObjectDefinition;
  type EnumDefinition = import("./schema").EnumDefinition;
}

export {};
