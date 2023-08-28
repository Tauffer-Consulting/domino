import React, { useCallback, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';

import TextInput from 'components/text-input';
import CheckboxInput from 'components/checkbox-input';

import SelectUpstreamInput from './select-upstream-input';
import { Option } from '../../piece-form.component/upstream-options';
import { disableCheckboxOptions } from './disableCheckboxOptions';
import SelectInput from 'components/select-input';
import { getDefinition } from 'utils';

interface Prop {
  name: `inputs.${string}.value.${number}`
  schema: ArrayObjectProperty;
  definitions: Definitions
  upstreamOptions: Option[]
}

const ObjectInputComponent: React.FC<Prop> = ({ schema, name, upstreamOptions, definitions }) => {
  const formsData = useWatch({ name })

  const itensSchema = useMemo(() => {
    return (getDefinition(schema,definitions) as ObjectDefinition).properties
  }, [schema, definitions])

  const [enumOptions, setEnumOptions] = useState<string[]>([])

  const isFromUpstream = useCallback((key: string) => {
    return (formsData?.fromUpstream[key] ?? false) as boolean
  }, [formsData])

  const defaultValues = useMemo(() => {
    const defaultValues = schema.default[0]

    return (defaultValues ?? {}) as Record<string, unknown>
  }, [schema])

  const elementType = useMemo(() => {
    const getElementType = function (key: string) {
      const schemaDefinition = getDefinition(schema,definitions)
      if ("properties" in schemaDefinition) {
        const itemSchemaDefinition = getDefinition(schemaDefinition.properties[key],definitions)
        if("enum" in itemSchemaDefinition){
          const valuesOptions = (itemSchemaDefinition as EnumDefinition).enum;
          setEnumOptions(valuesOptions)
          return "SelectInput"
        }
        return "TextInput"
      } else {
        return "TextInput";
      }
    }

    return Object.keys(defaultValues).reduce<Record<string, string>>((acc, cur) => {
      acc[cur] = getElementType(cur)
      return acc
    }, {})

  }, [defaultValues, schema, definitions])


  return (
    <>
      {Object.entries(defaultValues).map(([key, value]) => {
        const fromUpstream = isFromUpstream(key)
        const disableUpstream = disableCheckboxOptions(itensSchema[key] as any, upstreamOptions)
        return (
          <Grid
            key={key}
            container
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ marginBottom: 1 }}
          >
            {fromUpstream ?
              <Grid item xs={10}>
                <SelectUpstreamInput
                  label={key}
                  name={`${name}.upstreamValue.${key}`}
                  options={upstreamOptions}
                  object
                />
              </Grid>
              :
              <Grid item xs={10}>
                {elementType[key] === 'TextInput' &&
                  <TextInput
                    variant='outlined'
                    label={key}
                    name={`${name}.value.${key}`}
                  />
                }
                {elementType[key] === 'SelectInput' &&
                  <SelectInput
                    emptyValue
                    label={key}
                    name={`${name}.value.${key}`}
                    options={enumOptions}
                  />
                }
              </Grid>
            }
            <Grid
              item xs={2}
              sx={{ margin: 0 }}
            >
              <CheckboxInput
                name={`${name}.fromUpstream.${key}`}
                disabled={disableUpstream}
              />
            </Grid>
          </Grid>
        )
      })}
    </>
  );
}

export default ObjectInputComponent;
