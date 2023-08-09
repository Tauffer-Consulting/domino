import React, { useCallback, useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';

import TextInput from 'components/text-input';
import CheckboxInput from 'components/checkbox-input';

import SelectUpstreamInput from './select-upstream-input';
import { Option } from '../../piece-form.component/upstream-options';

interface Prop {
  name: `inputs.${string}.value.${number}`
  schema: any;
  definitions?: any
  upstreamOptions: Option[]
  checkedFromUpstreamDefault: boolean
  checkedFromUpstreamEditable: boolean
}

const ObjectInputComponent: React.FC<Prop> = ({ schema, name, upstreamOptions, checkedFromUpstreamDefault, checkedFromUpstreamEditable,definitions }) => {
  const formsData = useWatch({ name })

  const getFromUpstream = useCallback((key: string) => {
    return (formsData?.fromUpstream[key] ?? false) as boolean
  }, [formsData])

  const defaultValues = useMemo(() => {
    const defaultValues = schema.default[0]

    return (defaultValues ?? {}) as Record<string, unknown>
  }, [schema])

  // useEffect(()=>{
  //   if(schema.items["$ref"] === "#/definitions/OutputModifierModel"){
  //     console.log("Aqui")
  //     // Alterar o output_schema
  //   }
  //   // Não fazer nada
  // },[schema,definitions])

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
            sx={{marginBottom:1}}
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
                <TextInput
                  label={key}
                  name={`${name}.value.${key}`}
                  defaultValue={value as string}
                />
              </Grid>
            }
            <Grid
              item xs={2}
              sx={{ margin: 0 }}
            >
              <CheckboxInput
                name={`${name}.fromUpstream.${key}`}
                defaultChecked={checkedFromUpstreamDefault}
                disabled={!checkedFromUpstreamEditable}
              />
            </Grid>
          </Grid>
        )
      })}
    </>
  );
}

export default ObjectInputComponent;
