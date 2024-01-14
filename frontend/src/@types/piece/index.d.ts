/* eslint-disable @typescript-eslint/consistent-type-imports */
declare global {
  type Piece = import("./piece").Piece;
  type PiecesRepository = import("./piece").PiecesRepository;
  type Repository = import("./piece").Repository;

  type Schema = import("./schema").Schema;
  type FromUpstream = import("./schema").FromUpstream;
  type TypeName = import("./schema").TypeName;

  type Properties = import("./schema").Properties;
  type Property = import("./schema").Property;
  type SimpleProperty = import("./schema").SimpleProperty;
  type ArrayProperty = import("./schema").ArrayProperty;

  type StringProperty = import("./schema").StringProperty;
  type BooleanProperty = import("./schema").BooleanProperty;
  type NumberProperty = import("./schema").NumberProperty;
  type EnumProperty = import("./schema").EnumProperty;

  type ArrayStringProperty = import("./schema").ArrayStringProperty;
  type ArrayNumberProperty = import("./schema").ArrayNumberProperty;
  type ArrayBooleanProperty = import("./schema").ArrayBooleanProperty;
  type ArrayObjectProperty = import("./schema").ArrayObjectProperty;

  type Definitions = import("./schema").Definitions;
  type ObjectDefinition = import("./schema").ObjectDefinition;
  type EnumDefinition = import("./schema").EnumDefinition;
}

export {};
