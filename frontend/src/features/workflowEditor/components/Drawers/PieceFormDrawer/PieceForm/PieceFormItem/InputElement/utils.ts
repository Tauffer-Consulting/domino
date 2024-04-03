import { getDefinition, getFromUpstream } from "features/workflowEditor/utils";

export const getOptionalType = (
  property: Property | EnumDefinition,
): TypeName | FormatType | undefined => {
  if (property && "anyOf" in property && property.anyOf.length === 2) {
    const hasNullType = property.anyOf.some((item) => item.type === "null");
    if (hasNullType) {
      const itemSchema = property.anyOf.find(
        (itemSchema) => itemSchema.type !== "null",
      ) as SimpleProperty;

      return "format" in itemSchema ? itemSchema.format : itemSchema?.type;
    }
  }
};

export const isStringType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);

  return (
    ("type" in property && property.type === "string") ||
    optionalType === "string"
  );
};

export const isEnumType = (
  property: Property | EnumDefinition,
  definitions?: Definitions,
) => {
  return "allOf" in property && property.allOf.length > 0 && definitions;
};

export const isNumberType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);
  return (
    ("type" in property && property.type === "number" && !optionalType) ||
    optionalType === "number"
  );
};

export const isIntegerType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);
  return (
    ("type" in property && property.type === "integer" && !optionalType) ||
    optionalType === "integer"
  );
};

export const isBooleanType = (property: Property | EnumDefinition) => {
  return "type" in property && property.type === "boolean";
};

export const isDateOrTimeType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);

  return (
    ("type" in property &&
      "format" in property &&
      property.type === "string" &&
      property.format === "date" &&
      !optionalType) ||
    optionalType === "date" ||
    ("type" in property &&
      "format" in property &&
      property.type === "string" &&
      property.format === "time" &&
      !optionalType) ||
    optionalType === "time" ||
    ("type" in property &&
      "format" in property &&
      property.type === "string" &&
      property.format === "date-time" &&
      !optionalType) ||
    optionalType === "date-time"
  );
};

export const isCodeEditorType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);

  return (
    ("type" in property &&
      "widget" in property &&
      property.type === "string" &&
      property.widget?.includes("codeeditor")) ??
    (optionalType === "string" &&
      (property as StringProperty).widget?.includes("codeeditor"))
  );
};

export const isTextAreaType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);

  return (
    "widget" in property &&
    property.widget === "textarea" &&
    optionalType === "string"
  );
};

export const isArrayType = (property: Property | EnumDefinition) => {
  const optionalType = getOptionalType(property);

  return (
    ("type" in property && property.type === "array") ||
    (optionalType && optionalType === "array")
  );
};

export const extractArrayItemSchema = (
  property: ArrayProperty | AnyOfArray,
  definitions: Definitions,
) => {
  let subItemSchema =
    "items" in property
      ? property.items
      : (property.anyOf.find((s) => s.type === "array") as any)?.items;
  if (subItemSchema && "$ref" in subItemSchema && subItemSchema?.$ref) {
    const subItemSchemaName = subItemSchema.$ref.split("/").pop() as string;
    subItemSchema = definitions?.[subItemSchemaName];
  }

  return subItemSchema as Omit<SimpleProperty, "default"> | ObjectDefinition;
};

export const isObjectType = (property: ObjectDefinition) => {
  return "type" in property && property.type === "object";
};

export const extractCodeEditorLanguage = (property: StringProperty) => {
  return property?.widget?.includes("codeeditor-")
    ? property.widget.replace("codeeditor-", "")
    : "python";
};

export const extractArrayDefaultValue = (
  property: ArrayProperty | AnyOfArray,
  definitions: Definitions,
) => {
  if ("items" in property && "$ref" in property.items) {
    const definition = getDefinition(
      definitions,
      property.items,
    ) as ObjectDefinition;

    return {
      fromUpstream: emptyFromUpstreamObject(
        definition,
        property as ArrayObjectProperty,
        definitions,
      ),
      upstreamValue: emptyObject(definition, ""),
      upstreamId: emptyObject(definition, ""),
      value: emptyObject(definition),
    };
  } else if (
    "anyOf" in property &&
    property.anyOf.find((s) => s.type === "array" && "$ref" in s.items)
  ) {
    const anyOf = property.anyOf.find(
      (s) => s.type === "array" && "$ref" in s.items,
    ) as { items: Reference; type: "array" };

    const subProperty = getDefinition(
      definitions,
      anyOf.items,
    ) as ObjectDefinition;

    const response = {
      fromUpstream: emptyFromUpstreamObject(subProperty, property, definitions),
      upstreamValue: emptyObject(subProperty, ""),
      upstreamId: emptyObject(subProperty, ""),
      value: emptyObject(subProperty),
    };

    return response;
  } else if (
    "anyOf" in property &&
    property.anyOf.find((s) => s.type === "array" && !("$ref" in s.items))
  ) {
    const anyOf = property.anyOf.find(
      (s) => s.type === "array" && "$ref" in s.items,
    ) as { items: AnyOf["anyOf"]; type: "array" };

    const subProperty = anyOf.items.find((i) => i.type !== "null");

    const value =
      subProperty?.type === "string"
        ? ""
        : subProperty?.type === "number"
          ? 0.0
          : subProperty?.type === "boolean"
            ? false
            : subProperty?.type === "integer"
              ? 0
              : null;

    return {
      fromUpstream: getFromUpstream(property),
      upstreamValue: "",
      upstreamId: "",
      value,
    };
  } else {
    const subProperty = (
      property as
        | ArrayBooleanProperty
        | ArrayNumberProperty
        | ArrayStringProperty
    ).items;

    const value =
      subProperty.type === "string"
        ? ""
        : subProperty.type === "number"
          ? 0.0
          : subProperty.type === "boolean"
            ? false
            : subProperty.type === "integer"
              ? 0
              : null;

    return {
      fromUpstream: getFromUpstream(property),
      upstreamValue: "",
      upstreamId: "",
      value,
    };
  }
};

function emptyFromUpstreamObject(
  object: ObjectDefinition,
  property: ArrayObjectProperty | AnyOfArray,
  definitions: Definitions,
) {
  const newObject: Record<string, any> = {};

  Object.keys(object.properties).forEach((k) => {
    const fromUpstream = getFromUpstream(property, definitions, k);
    newObject[k] = fromUpstream;
  });
  return newObject;
}

function emptyObject(objectDefinition: ObjectDefinition, defaultValue?: any) {
  const newObject: Record<string, any> = {};

  for (const [key, property] of Object.entries(objectDefinition.properties)) {
    if ("anyOf" in property) {
      newObject[key] = "";
    } else {
      const value =
        property.type === "string"
          ? ""
          : property.type === "number"
            ? 0.0
            : property.type === "boolean"
              ? false
              : property.type === "integer"
                ? 0
                : null;

      newObject[key] = defaultValue ?? value;
    }
  }

  return newObject;
}
