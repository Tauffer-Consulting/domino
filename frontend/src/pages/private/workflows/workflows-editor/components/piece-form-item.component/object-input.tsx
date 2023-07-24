import React, { useCallback, useMemo } from 'react';
import { Option } from '../piece-form.component/upstream-options';
import TextInput from './text-input';
import SelectUpstreamInput from './select-upstream-input';
import { Box, Container, Grid } from '@mui/material';
import CheckboxInput from './checkbox-input';
import { useWatch } from 'react-hook-form';

interface Prop {
  name: `inputs.${string}.value.${number}`
  schema: any;
  definitions?: any
  upstreamOptions: Option[]
  checkedFromUpstreamDefault: boolean
  checkedFromUpstreamEditable: boolean
}

const ObjectInputComponent: React.FC<Prop> = ({ schema, name, upstreamOptions, checkedFromUpstreamDefault, checkedFromUpstreamEditable }) => {
  /**
   * {
   * "id":"1ef601c7-9b67-409f-98f3-937de10d83dc"}
   * "fromUpstream":false,
   * "upstreamId":{
   *    "arg_name":"",
   *    "arg_value":""
   * },
   * "upstreamArgument":{
   *    "arg_name":"",
   *    "arg_value":""
   * },
   * "upstreamValue":"",
   * "value": {
   *    "arg_name":"country",
   *    "arg_value":"Brazil"
   * },
   */

  const formsData = useWatch({ name })

  const getFromUpstream = useCallback((key: string) => {
    return (formsData?.fromUpstream[key] ?? false) as boolean
  }, [formsData])

  const defaultValues = useMemo(() => {
    const defaultValues = schema.default[0]

    return (defaultValues ?? {}) as Record<string, unknown>
  }, [schema])



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
