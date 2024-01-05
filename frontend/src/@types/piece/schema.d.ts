export interface Schema {
  title: string;
  description: string;

  type: "object";

  properties: Properties;
  $defs: Definitions;
}

export type Properties = Record<string, Property>;

export type Property =
  | BooleanProperty
  | NumberProperty
  | StringProperty
  | EnumProperty
  | ArrayStringProperty
  | ArrayNumberProperty
  | ArrayBooleanProperty
  | ArrayObjectProperty
  | AnyOfProperty;

interface DefaultPropertyAttrs {
  title: string;
  description: string;
  from_upstream?: FromUpstream;
}

export type FromUpstream = "always" | "never" | "allowed";

export type BooleanProperty = DefaultPropertyAttrs & {
  type: "boolean";
  default: boolean;
};

export type NumberProperty = DefaultPropertyAttrs & {
  type: "number" | "integer" | "float";
  default: number;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
};

export type StringProperty = DefaultPropertyAttrs & {
  type: "string";
  default: string;

  widget?: string;
  format?: "date" | "time" | "date-time";
};

export type EnumProperty = DefaultPropertyAttrs & {
  allOf: Reference[];
  default: string;
};

export type ArrayStringProperty = DefaultPropertyAttrs & {
  type: "array";
  default: string[];
  items: {
    type: "string";

    widget?: string;
    format?: "date" | "time" | "date-time";
  };
};

export type ArrayNumberProperty = DefaultPropertyAttrs & {
  type: "array";
  default: number[];
  items: {
    type: "number" | "integer";
  };
};

export type ArrayBooleanProperty = DefaultPropertyAttrs & {
  type: "array";
  default: boolean[];
  items: {
    type: "boolean";
  };
};

export type ArrayObjectProperty = DefaultPropertyAttrs & {
  type: "array";
  default: Array<Record<string, string | boolean | number>>;
  items: Reference;
};

export interface Reference {
  $ref: `#/$defs/${string}`;
}

export type AnyOfProperty =
  | (DefaultPropertyAttrs & {
      anyOf: Array<{
        type: "null";
        format?: string;
      }>;
      default: any;
    })
  | (DefaultPropertyAttrs & {
      anyOf: Array<{
        type: "number" | "integer" | "float";
      }>;
      default: NumberProperty["default"];
    })
  | (DefaultPropertyAttrs & {
      anyOf: Array<{
        type: "string";
        format?: string;
      }>;
      default: StringProperty["default"];
    })
  | (DefaultPropertyAttrs & {
      anyOf: Array<{ type: "boolean" }>;
      default: BooleanProperty["default"];
    })
  | (DefaultPropertyAttrs & {
      anyOf: Array<{ type: "array" }>;
      default:
        | ArrayStringProperty["default"]
        | ArrayNumberProperty["default"]
        | ArrayBooleanProperty["default"]
        | ArrayObjectProperty["default"];
    });

export type Definitions = Record<string, EnumDefinition | ObjectDefinition>;

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
  properties: Record<
    string,
    | EnumDefinition
    | BooleanProperty
    | NumberProperty
    | StringProperty
    | EnumProperty
    | AnyOfProperty
  >;
  required: string[];
}

export {};
