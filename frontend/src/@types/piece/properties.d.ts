interface Reference {
  $ref: `#/$defs/${string}`;
}
type FromUpstream = "always" | "never" | "allowed";

interface DefaultPropertyProps {
  title: string;
  description: string;
  from_upstream?: FromUpstream;
}

type BooleanProperty = DefaultPropertyProps & {
  type: "boolean" | "null";
  default: boolean;
};

type NumberProperty = DefaultPropertyProps & {
  type: "number" | "integer" | "float" | "null";
  default: number;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
};

type StringProperty = DefaultPropertyProps & {
  type: "string" | "null";
  default: string;

  widget?: string;
  format?: "date" | "time" | "date-time";
};

type EnumProperty = DefaultPropertyProps & {
  allOf: Reference[];
  default: string;
};

type ArrayStringProperty = DefaultPropertyProps & {
  type: "array";
  default: string[];
  items: {
    type: "string";

    widget?: string;
    format?: "date" | "time" | "date-time";
  };
};

type ArrayNumberProperty = DefaultPropertyProps & {
  type: "array";
  default: number[];
  items: {
    type: "number" | "integer";
  };
};

type ArrayBooleanProperty = DefaultPropertyProps & {
  type: "array";
  default: boolean[];
  items: {
    type: "boolean";
  };
};

type ArrayObjectProperty = DefaultPropertyProps & {
  type: "array";
  default: Array<Record<string, string | boolean | number>>;
  items: Reference;
};

export type SimpleInputSchemaProperty =
  | BooleanProperty
  | NumberProperty
  | StringProperty
  | EnumProperty;

type AnyOfObjectProperty = DefaultPropertyProps & {
  anyOf: StringProperty[];
  default:
    | ArrayObjectProperty.default
    | NumberProperty.default
    | StringProperty.default;
};

export type InputSchemaProperty =
  | SimpleInputSchemaProperty
  | ArrayStringProperty
  | ArrayNumberProperty
  | ArrayBooleanProperty
  | ArrayObjectProperty
  | AnyOfObjectProperty;
