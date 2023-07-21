import React, { useMemo } from 'react';
import { Option } from '../piece-form.component/upstream-options';
import TextInput from './text-input';
import SelectUpstreamInput from './select-upstream-input';

interface Prop {
  name: `inputs.${string}.value.${number}`
  schema: any;
  definitions?: any
  upstreamOptions: Option[]
  fromUpstream: boolean
}

const ObjectInputComponent: React.FC<Prop> = ({ schema,name,fromUpstream, upstreamOptions }) => {
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

  const defaultValues = useMemo(()=>{
    const defaultValues = schema.default[0]

    return defaultValues
  },[schema])

  return (
    <>
      {!fromUpstream && Object.entries(defaultValues).map(([key,value])=>{
        return (
          <TextInput
            label={key}
            name={`${name}.value.${key}`}
            defaultValue={value as string}
          />
        )
      })}
      {fromUpstream && Object.entries(defaultValues).map(([key])=>{
        return (
          <SelectUpstreamInput
            label={key}
            name={`${name}.upstreamValue.${key}`}
            options={upstreamOptions}
            object
          />
        )
      })}
    </>
  );
}

export default ObjectInputComponent;
