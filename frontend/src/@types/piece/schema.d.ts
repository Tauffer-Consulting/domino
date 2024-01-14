export type TypeName =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "integer"
  | "array"
  | "null";

export interface Schema {
  title: string;
  description: string;

  type: "object";

  properties: Properties;
  $defs: Definitions;
}

export type Properties = Record<string, Property>;

export type Property = SimpleProperty | ArrayProperty | AnyOfProperty;

export type SimpleProperty =
  | BooleanProperty
  | NumberProperty
  | StringProperty
  | EnumProperty;

export type ArrayProperty =
  | ArrayBooleanProperty
  | ArrayNumberProperty
  | ArrayStringProperty
  | ArrayObjectProperty;

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
  type: "number" | "integer";
  default: number;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
};

export type StringProperty = DefaultPropertyAttrs & {
  type: "string";
  default: string;

  widget?: `codeeditor-${string}` | "textarea";
  format?: "date" | "time" | "date-time";
};

export type EnumProperty = DefaultPropertyAttrs & {
  allOf: Reference[];
  default: string;
};

export type ArrayBooleanProperty = DefaultPropertyAttrs & {
  type: "array";
  default: boolean[];
  items: Omit<BooleanProperty, "default">;
};

export type ArrayNumberProperty = DefaultPropertyAttrs & {
  type: "array";
  default: number[];
  items: Omit<NumberProperty, "default">;
};

export type ArrayStringProperty = DefaultPropertyAttrs & {
  type: "array";
  default: string[];
  items: Omit<StringProperty, "default">;
};

export type ArrayObjectProperty = DefaultPropertyAttrs & {
  type: "array";
  default: Array<Record<string, string | boolean | number>>;
  items: Reference;
};

export interface Reference {
  $ref: `#/$defs/${string}`;
}

type AnyOf = DefaultPropertyAttrs & {
  anyOf: Array<{
    type: "null" | "number" | "integer" | "string" | "boolean";
    widget?: `codeeditor-${string}` | "textarea";
    format?: "date" | "time" | "date-time";
  }>;
  default: any;
};

export type AnyOfArray = DefaultPropertyAttrs & {
  anyOf: Array<{ items: AnyOf["anyOf"]; type: "array" } | { type: "null" }>;
  default: any[];
};

export type AnyOfProperty = AnyOf | AnyOfArray;

export type Definitions = Record<
  string,
  EnumDefinition | ObjectDefinition | SimpleProperty
>;

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
  properties: Record<string, EnumDefinition | SimpleProperty | AnyOfProperty>;
  required: string[];
}

export {};
