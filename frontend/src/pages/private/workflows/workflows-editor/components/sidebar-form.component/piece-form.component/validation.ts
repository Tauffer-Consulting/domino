import * as yup from "yup";

const defaultValidation = {
  fromUpstream: yup.boolean(), // ? allowed | never | always
  upstreamArgument: yup.string().when("fromUpstream", ([fromUpstream]) => {
    if (fromUpstream) {
      return yup.string().required();
    }
    return yup.string();
  }),
  upstreamId: yup.string().when("fromUpstream", ([fromUpstream]) => {
    if (fromUpstream) {
      return yup.string().required();
    }
    return yup.string();
  }),
  upstreamValue: yup.string().when("fromUpstream", ([fromUpstream]) => {
    if (fromUpstream) {
      return yup.string().required();
    }
    return yup.string();
  }),
};

const validationObject = () => {
  return yup.lazy((value) => {
    const rawValidationObject = Object.entries(
      value.fromUpstream,
    ).reduce<yup.AnyObject>(
      (objValidation, [key, fromUpstream]) => {
        if (fromUpstream) {
          objValidation.fromUpstream[key] = yup.boolean().required();
          objValidation.upstreamArgument[key] = yup.string().required();
          objValidation.upstreamId[key] = yup.string().required();
          objValidation.upstreamValue[key] = yup.string().required();
          objValidation.value[key] = yup.mixed().notRequired();
        } else {
          objValidation.fromUpstream[key] = yup.boolean().required();
          objValidation.upstreamArgument[key] = yup.mixed().notRequired();
          objValidation.upstreamId[key] = yup.mixed().notRequired();
          objValidation.upstreamValue[key] = yup.mixed().notRequired();
          objValidation.value[key] = yup.string().required();
        }

        return objValidation;
      },
      {
        fromUpstream: {},
        upstreamArgument: {},
        upstreamId: {},
        upstreamValue: {},
        value: {},
      },
    );

    const validationObject = Object.entries(rawValidationObject).reduce(
      (acc, [key, obj]) => {
        return { ...acc, [key]: yup.object(obj) };
      },
      {},
    );

    return yup.object().shape(validationObject);
  });
};

function getValidationValueBySchemaType(schema: any) {
  let inputSchema;

  if (schema.type === "number" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.number().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.number().typeError("Must must be a number").required();
      }),
    });
  } else if (schema.type === "integer" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.number().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup
          .number()
          .integer()
          .typeError("Must must be a number")
          .required();
      }),
    });
  } else if (schema.type === "boolean" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.boolean().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.boolean().required();
      }),
    });
  } else if (schema.type === "string" && schema.format === "date") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.string().required();
      }),
    });
  } else if (schema.type === "string" && schema?.format === "time") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.string().required();
      }),
    });
  } else if (schema.type === "string" && schema?.format === "date-time") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.string().required();
      }),
    });
  } else if (schema.type === "string" && schema?.widget === "codeeditor") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.string();
      }),
    });
  } else if (schema.type === "string" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.string().required();
      }),
    });
  } else if (schema.type === "object") {
    inputSchema = validationObject();
  } else {
    inputSchema = yup.mixed().notRequired();
  }

  return inputSchema;
}

export function createInputsSchemaValidation(schema: any) {
  if (!schema?.properties) {
    return yup.mixed().notRequired();
  }

  const validationSchema = Object.entries(schema.properties).reduce(
    (acc, cur: [string, any]) => {
      const [key, subSchema] = cur;
      let inputSchema;

      if (subSchema.type === "array") {
        let subItemSchema: any = subSchema?.items;
        if (subSchema?.items?.$ref) {
          const subItemSchemaName = subSchema.items.$ref.split("/").pop();
          subItemSchema = schema.definitions?.[subItemSchemaName];
        }
        inputSchema = yup.object({
          ...defaultValidation,
          value: yup
            .array()
            .of(getValidationValueBySchemaType(subItemSchema) as any),
        });
      } else {
        inputSchema = getValidationValueBySchemaType(subSchema);
      }

      return { ...acc, [key]: inputSchema };
    },
    {},
  );

  return yup.object().shape(validationSchema);
}
