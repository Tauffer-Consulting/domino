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

function getValidationValueBySchemaType(schema: any, required: boolean) {
  let inputSchema;

  if (schema.type === "number" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.number().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.number().typeError("Must must be a number").required(); // number is always required
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
          .required(); // number is always required
      }),
    });
  } else if (schema.type === "boolean" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.boolean().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.boolean().required(); // boolean is always required
      }),
    });
  } else if (schema.type === "string" && schema.format === "date") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup.date().required(); // date is always required
      }),
    });
  } else if (schema.type === "string" && schema?.format === "time") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup
          .string()
          .required("Time is required")
          .test("valid-datetime", "Invalid time format", (value) => {
            const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
            return timeRegex.test(value);
          }); // Time is always required
      }),
    });
  } else if (schema.type === "string" && schema?.format === "date-time") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return yup
          .string()
          .required("Datetime is required") // Change the error message as needed
          .test("valid-datetime", "Invalid datetime format", (value) => {
            const dateTimeRegex =
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?Z?$/;
            return dateTimeRegex.test(value);
          }); // Datetime is always required
      }),
    });
  } else if (schema.type === "string" && schema?.widget === "codeeditor") {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return required ? yup.string().required() : yup.string();
      }),
    });
  } else if (schema.type === "string" && !schema.format) {
    inputSchema = yup.object({
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired();
        }
        return required ? yup.string().required() : yup.string().nullable();
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

  const requiredFields = schema?.required || [];

  const validationSchema = Object.entries(schema.properties).reduce(
    (acc, cur: [string, any]) => {
      const [key, subSchema] = cur;
      let inputSchema;

      if (subSchema.type === "array") {
        let subItemSchema: any = subSchema?.items;
        if (subSchema?.items?.$ref) {
          const subItemSchemaName = subSchema.items.$ref.split("/").pop();
          subItemSchema = schema.$defs?.[subItemSchemaName];
        }
        const required = true; // for arrays, we always require the value
        inputSchema = yup.object({
          ...defaultValidation,
          value: yup.array().when("fromUpstream", (fromUpstream) => {
            if (fromUpstream) {
              return yup.mixed().notRequired();
            }

            return yup
              .array()
              .of(
                getValidationValueBySchemaType(subItemSchema, required) as any,
              );
          }),
        });
      } else {
        const required = requiredFields.includes(key);
        inputSchema = getValidationValueBySchemaType(subSchema, required);
      }

      return { ...acc, [key]: inputSchema };
    },
    {},
  );

  return yup.object().shape(validationSchema);
}
