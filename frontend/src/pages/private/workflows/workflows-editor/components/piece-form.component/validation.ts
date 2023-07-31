import * as yup from "yup"

const defaultValidation = {
  fromUpstream: yup.boolean(), //? allowed | never | always
  upstreamArgument: yup.string().when("fromUpstream", ([fromUpstream]) => {
    if (fromUpstream) {
      return yup.string().required()
    }
    return yup.string()
  }),
  upstreamId: yup.string().when("fromUpstream", ([fromUpstream]) => {
    if (fromUpstream) {
      return yup.string().required()
    }
    return yup.string()
  }),
  upstreamValue: yup.string().when("fromUpstream", ([fromUpstream]) => {
    if (fromUpstream) {
      return yup.string().required()
    }
    return yup.string()
  }),
}

const validationObject = {
  fromUpstream: yup.lazy(obj => {
    return yup.object().shape(Object.keys(obj).reduce((acc, val) => ({
      ...acc,
      [val]: yup.boolean().required()
    }), {}))
  }),
  upstreamArgument: yup.lazy(obj => {
    return yup.object().shape(Object.keys(obj).reduce((acc, val) => ({
      ...acc,
      [val]: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (!fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string().required()
      })
    }), {}))
  }),
  upstreamId: yup.lazy(obj => {
    return yup.object().shape(Object.keys(obj).reduce((acc, val) => ({
      ...acc,
      [val]: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (!fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string().required()
      })
    }), {}))
  }),
  value: yup.lazy(obj => {
    return yup.object().shape(Object.keys(obj).reduce((acc, val) => ({
        ...acc,
        [val]: yup.string().when("fromUpstream", ([fromUpstream]) => {
          if (fromUpstream) {
            return yup.mixed().notRequired()
          }
          return yup.string().required()
        })
      })
    , {}))
  }),
}

function getValidationValueBySchemaType(schema: any) {
  let inputSchema = {}

  if ((schema.type === 'number') && !schema.format) {
    inputSchema = {
      ...defaultValidation,
      value: yup.number().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.number().required()
      })
    }
  }
  else if (schema.type === 'integer' && !schema.format) {
    inputSchema = {
      ...defaultValidation,
      value: yup.number().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.number().integer().required()
      })
    }
  }
  else if (schema.type === 'boolean' && !schema.format) {
    inputSchema = {
      ...defaultValidation,
      value: yup.boolean().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.boolean().required()
      })
    }
  }
  else if (schema.type === 'string' && schema.format === 'date') {
    inputSchema = {
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string().required()
      })
    }
  }
  else if (schema.type === 'string' && schema?.format === 'time') {
    inputSchema = {
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string().required()
      })
    }
  }
  else if (schema.type === 'string' && schema?.format === 'date-time') {
    inputSchema = {
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string().required()
      })
    }
  }
  else if (schema.type === 'string' && schema?.widget === 'codeeditor') {
    inputSchema = {
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string()
      })
    }
  }
  else if (schema.type === 'string' && !schema.format) {
    inputSchema = {
      ...defaultValidation,
      value: yup.string().when("fromUpstream", ([fromUpstream]) => {
        if (fromUpstream) {
          return yup.mixed().notRequired()
        }
        return yup.string().required()
      })
    }
  }
  else if (schema.type === 'object') {
    inputSchema = validationObject
  }
  else {
    inputSchema = {}
  }

  return inputSchema
}

export function createInputsSchemaValidation(schema: any) {
  if (!schema?.properties) {
    return yup.mixed().notRequired()
  }

  const validationSchema = yup.lazy(() => {
    const validationSchema =
      Object.entries(schema.properties).reduce((acc, cur: [string, any]) => {
        const [key, subSchema] = cur
        let inputSchema: any = {}

        if (subSchema.type === 'array') {
          let subItemSchema: any = subSchema?.items;
          if (subSchema?.items?.$ref) {
            const subItemSchemaName = subSchema.items.$ref.split('/').pop();
            subItemSchema = schema.definitions?.[subItemSchemaName];
          }
          inputSchema = {}
          inputSchema = {
            ...defaultValidation,
            value: yup.array().of(
              yup.object(getValidationValueBySchemaType(subItemSchema))
            )
          }
        } else {
          inputSchema = getValidationValueBySchemaType(subSchema)
        }

        return { ...acc, [key]: yup.object(inputSchema) }
      }, {})

    return yup.object().shape(validationSchema)
  })

  return validationSchema
}
