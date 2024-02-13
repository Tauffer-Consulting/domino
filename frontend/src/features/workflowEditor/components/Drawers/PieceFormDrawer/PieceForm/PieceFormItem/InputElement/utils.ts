export const getOptionalType = (
  property: Property | EnumDefinition | EnumDefinition,
): TypeName | FormatType | undefined => {
  if ("anyOf" in property && property.anyOf.length === 2) {
    const hasNullType = property.anyOf.some((item) => item.type === "null");
    if (hasNullType) {
      const itemSchema = property.anyOf.find(
        (itemSchema) => itemSchema.type !== "null",
      ) as SimpleProperty;

      return "format" in itemSchema ? itemSchema.format : itemSchema?.type;
    }
  }
};

export const isStringType = (
  property: Property | EnumDefinition,
  anyOfType?: TypeName | WidgetType | FormatType,
) => {
  return (
    ("type" in property && property.type === "string") || anyOfType === "string"
  );
};

export const isEnumType = (
  property: Property | EnumDefinition,
  definitions?: Definitions,
) => {
  return "allOf" in property && property.allOf.length > 0 && definitions;
};

export const isNumberType = (
  property: Property | EnumDefinition,
  anyOfType?: TypeName | FormatType,
) => {
  return (
    ("type" in property && property.type === "number" && !anyOfType) ||
    anyOfType === "number" ||
    ("type" in property && property.type === "integer" && !anyOfType) ||
    anyOfType === "integer"
  );
};

export const isBooleanType = (property: Property | EnumDefinition) => {
  return "type" in property && property.type === "boolean";
};

export const isDateOrTimeType = (
  property: Property | EnumDefinition,
  anyOfType?: TypeName | WidgetType | FormatType,
) => {
  return (
    ("type" in property &&
      "format" in property &&
      property.type === "string" &&
      property.format === "date" &&
      !anyOfType) ||
    anyOfType === "date" ||
    ("type" in property &&
      "format" in property &&
      property.type === "string" &&
      property.format === "time" &&
      !anyOfType) ||
    anyOfType === "time" ||
    ("type" in property &&
      "format" in property &&
      property.type === "string" &&
      property.format === "date-time" &&
      !anyOfType) ||
    anyOfType === "date-time"
  );
};

export const isCodeEditorType = (
  property: Property | EnumDefinition,
  anyOfType?: TypeName | FormatType,
) => {
  return (
    ("type" in property &&
      "widget" in property &&
      property.type === "string" &&
      property.widget?.includes("codeeditor")) ??
    (anyOfType === "string" &&
      (property as StringProperty).widget?.includes("codeeditor"))
  );
};

export const isTextAreaType = (
  property: Property | EnumDefinition,
  anyOfType?: TypeName | FormatType,
) => {
  return (
    "widget" in property &&
    property.widget === "textarea" &&
    anyOfType === "string"
  );
};

export const isArrayInput = (
  property: Property | EnumDefinition,
  optionalType?: TypeName | FormatType,
) => {
  return (
    ("type" in property && property.type === "array") ||
    (optionalType && optionalType === "array")
  );
};

export const isObjectType = (property: ObjectDefinition) => {
  return "type" in property && property.type === "object";
};

export const extractCodeEditorLanguage = (property: StringProperty) => {
  return property?.widget?.includes("codeeditor-")
    ? property.widget.replace("codeeditor-", "")
    : "python";
};
