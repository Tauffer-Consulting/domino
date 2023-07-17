import React, { useMemo } from 'react';
import {
  Checkbox,
  Box,
  Grid,
} from '@mui/material';
import { UseFormRegister, Control, Controller, useFormContext } from 'react-hook-form';

import { Input, IWorkflowPieceData, InputArray } from 'context/workflows/types';
import { Option } from '../piece-form.component';

import SelectUpstreamInput from './select-upstream-input';
import NumberInput from './number-input';
import CheckboxInput from './checkbox-input';
import SelectInput from './select-input';
import DatetimeInput from './datetime-input';
import CodeEditorInput from './codeeditor-input';
import TextInput from './text-input';


interface PieceFormItemProps {
  schema: any;
  itemKey: string;
  inputProperties: Input | InputArray;
  register: UseFormRegister<IWorkflowPieceData>
  control: Control<IWorkflowPieceData, any>
  definitions?: any
  upstreamOptions: Option[]
}

const PieceFormItem: React.FC<PieceFormItemProps> = ({ upstreamOptions, itemKey, inputProperties, schema, definitions, register, control }) => {
  const [checkedFromUpstreamAllowed, checkedFromUpstreamEditable] = useMemo(() => {
    // from_upstream condition, if "never" or "always"
    let allowed: boolean = true;
    let editable: boolean = true;
    let arrayItems: string = "allowed";
    if (schema?.from_upstream === "never") {
      allowed = false;
      editable = false;
      if (schema.type === 'array') {
        arrayItems = "never";
      }
    } else if (schema?.from_upstream === "always") {
      allowed = true;
      editable = false;
      if (schema.type === 'array') {
        allowed = false;
        arrayItems = "always";
      }
    }
    return [allowed, editable, arrayItems]
  }, [schema])

  const { watch } = useFormContext()
  const data = watch()
  const checkedFromUpstream = data.inputs[itemKey]?.fromUpstream

  if (!inputProperties || !Object.keys(inputProperties).length) {
    return null
  }

  let inputElement: React.ReactNode = null

  if (checkedFromUpstream && upstreamOptions.length) {
    inputElement = (
      <SelectUpstreamInput
        itemKey={itemKey}
        label={schema?.title}
        options={upstreamOptions}
      />);
  } else if (schema?.allOf && schema.allOf.length > 0) {
    const typeClass = schema.allOf[0]['$ref'].split("/").pop();
    const valuesOptions: Array<string> = definitions?.[typeClass].enum;
    inputElement =
      <SelectInput
        label={itemKey}
        defaultValue={schema?.default}
        itemKey={itemKey}
        options={valuesOptions}
      />
  } else if ((schema.type === 'number') && !schema.format) {
    inputElement =
      <NumberInput
        itemKey={itemKey}
        type="float"
        label={schema.title}
        defaultValue={schema?.default ?? 10.5}
      />
  } else if (schema.type === 'integer' && !schema.format) {
    inputElement =
      <NumberInput
        itemKey={itemKey}
        type="int"
        label={schema.title}
        defaultValue={schema?.default ?? 10}
      />
  } else if (schema.type === 'boolean' && !schema.format) {
    inputElement = <CheckboxInput label={schema.title} itemKey={itemKey} />
  } else if (schema.type === 'array') {
    inputElement = null
      // <ArrayInput
      //   itemKey={itemKey}
      //   schema={schema}
      //   definitions={schema.definitions}
      //   upstreamOptions={upstreamOptions}
      //   control={control}
      //   register={register}
      //   inputProperties={inputProperties as InputArray}
      // />
  } else if (schema.type === 'string' && schema.format === 'date') {
    inputElement =
      <DatetimeInput
        itemKey={itemKey}
        label={schema.title}
        type="date"
        defaultValue={inputProperties.value as string}
      />;
  } else if (schema.type === 'string' && schema?.format === 'time') {
    inputElement =
      <DatetimeInput
        itemKey={itemKey}
        label={schema.title}
        type="time"
        defaultValue={inputProperties.value as string}
      />;
  } else if (schema.type === 'string' && schema?.format === 'date-time') {
    inputElement =
      <DatetimeInput
        itemKey={itemKey}
        label={schema.title}
        type="date-time"
        defaultValue={inputProperties.value as string}
      />;
  }
  else if (schema.type === 'string' && schema?.widget === 'codeeditor') {
    inputElement =
      <CodeEditorInput
        itemKey={itemKey}
      />
  } else if (schema.type === 'string' && !schema.format) {
    inputElement =
      <TextInput  itemKey={itemKey} label={schema.title}/>;
  } else {
    inputElement = <div style={{ color: "red", fontWeight: "bold" }}>
      Unknown widget type for {schema.title}
    </div>;
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ paddingTop: "10px" }}
    >
      <Grid item xs={12}>
        {inputElement}
      </Grid>
      {checkedFromUpstreamAllowed ? (
        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Controller
            name={`inputs.${itemKey}.fromUpstream`}
            control={control}
            defaultValue={inputProperties?.fromUpstream}
            render={({ field }) => (
              <Checkbox
                {...field}
                disabled={!checkedFromUpstreamEditable || !upstreamOptions.length}
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            )}
          />
        </Grid>
      ) : null}
    </Box>
  );
};

export default PieceFormItem;
