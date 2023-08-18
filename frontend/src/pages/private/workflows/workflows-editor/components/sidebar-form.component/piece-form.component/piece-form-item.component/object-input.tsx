import React, { useCallback, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';

import TextInput from 'components/text-input';
import CheckboxInput from 'components/checkbox-input';

import SelectUpstreamInput from './select-upstream-input';
import { Option } from '../../piece-form.component/upstream-options';
import { useUpstreamCheckboxOptions } from './useUpstreamCheckboxOptions';
import SelectInput from 'components/select-input';

interface Prop {
  name: `inputs.${string}.value.${number}`
  schema: any;
  definitions?: any
  upstreamOptions: Option[]
  checkedFromUpstreamDefault: boolean
  checkedFromUpstreamEditable: boolean
}

const ObjectInputComponent: React.FC<Prop> = ({ schema, name, upstreamOptions, definitions }) => {
  const formsData = useWatch({ name })
  const [checkedUpstream, disableUpstream] = useUpstreamCheckboxOptions(schema, upstreamOptions)

  const [enumOptions, setEnumOptions] = useState<string[]>([])

  const getFromUpstream = useCallback((key: string) => {
    return (formsData?.fromUpstream[key] ?? false) as boolean
  }, [formsData])

  const defaultValues = useMemo(() => {
    const defaultValues = schema.default[0]

    return (defaultValues ?? {}) as Record<string, unknown>
  }, [schema])

  const elementType = useMemo(() => {
    const getElementType = function (key: string) {
      if (schema?.items?.["$ref"] === '#/definitions/OutputModifierModel' && key === "type") {
        const valuesOptions: Array<string> = definitions?.["OutputModifierItemType"].enum;
        setEnumOptions(valuesOptions)
        return "SelectInput"
      } else {
        return "TextInput";
      }
    }

    return Object.keys(defaultValues).reduce<Record<string, string>>((acc, cur) => {
      acc[cur] = getElementType(cur)
      return acc
    }, {})

  }, [schema?.items, defaultValues, definitions])


  return (
    <>
      {Object.entries(defaultValues).map(([key, value]) => {
        const fromUpstream = getFromUpstream(key)

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
                defaultChecked={checkedUpstream}
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
