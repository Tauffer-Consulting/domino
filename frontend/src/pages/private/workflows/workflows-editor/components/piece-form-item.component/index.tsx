import React, { useMemo } from 'react';
import {
  Box,
  Grid,
} from '@mui/material';
import { Control, useFormContext } from 'react-hook-form';

import { IWorkflowPieceData } from 'context/workflows/types';

import NumberInput from 'components/number-input';
import CheckboxInput from 'components/checkbox-input';
import SelectInput from 'components/select-input';
import DatetimeInput from 'components/datetime-input';
import CodeEditorInput from 'components/codeeditor-input';
import TextInput from 'components/text-input';

import SelectUpstreamInput from './select-upstream-input';
import ArrayInput from './array-input';

import { ArrayOption, Option } from '../piece-form.component/upstream-options';

interface PieceFormItemProps {
  schema: any;
  itemKey: string;
  control: Control<IWorkflowPieceData, any>
  definitions?: any
  upstreamOptions: Option[] | ArrayOption
}

const PieceFormItem: React.FC<PieceFormItemProps> = ({ upstreamOptions, itemKey, schema, definitions, control }) => {
  const [checkedFromUpstreamDefault, checkedFromUpstreamEditable] = useMemo(() => {
    // from_upstream condition, if "never" or "always"
    let defaultChecked: boolean = true;
    let editable: boolean = true;
    if (schema?.from_upstream === "never") {
      defaultChecked = false;
      editable = false;
    } else if (schema?.from_upstream === "always") {
      defaultChecked = true;
      editable = false;
    }

    if (schema?.allOf && schema.allOf.length > 0) {
      defaultChecked = true;
      editable = false;
    }

    if (!(upstreamOptions as Option[])?.length) {
      editable = false;
    }

    if ((upstreamOptions as ArrayOption)?.array?.length) {
      editable = true;
    }

    return [defaultChecked, editable]
  }, [schema, upstreamOptions])

  const { watch } = useFormContext<IWorkflowPieceData>()
  const data = watch()
  const checkedFromUpstream = data.inputs[itemKey]?.fromUpstream

  let inputElement: React.ReactNode = null

  if (checkedFromUpstream) {
    let options: Option[] = []
    if (schema.type === 'array') {
      options = (upstreamOptions as ArrayOption).array
    } else {
      options = upstreamOptions as Option[]
    }

    inputElement = (
      <SelectUpstreamInput
        name={`inputs.${itemKey}`}
        label={schema?.title}
        options={options}
      />);
  } else if (schema?.allOf && schema.allOf.length > 0) {
    const typeClass = schema.allOf[0]['$ref'].split("/").pop();
    const valuesOptions: Array<string> = definitions?.[typeClass].enum;
    inputElement =
      <SelectInput<IWorkflowPieceData>
        label={itemKey}
        defaultValue={schema?.default}
        name={`inputs.${itemKey}.value`}
        options={valuesOptions}
      />
  } else if ((schema.type === 'number') && !schema.format) {
    inputElement =
      <NumberInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        type="float"
        label={schema.title}
        defaultValue={schema?.default ?? 10.5}
      />
  } else if (schema.type === 'integer' && !schema.format) {
    inputElement =
      <NumberInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        type="int"
        label={schema.title}
        defaultValue={schema?.default ?? 10}
      />
  } else if (schema.type === 'boolean' && !schema.format) {
    inputElement = <CheckboxInput<IWorkflowPieceData>
      name={`inputs.${itemKey}.value`}
      label={schema.title}
    />
  } else if (schema.type === 'array') {
    inputElement =
      <ArrayInput
        inputKey={itemKey}
        schema={schema}
        definitions={definitions}
        upstreamOptions={upstreamOptions as ArrayOption}
        control={control}
      />
  } else if (schema.type === 'string' && schema.format === 'date') {
    inputElement =
      <DatetimeInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="date"
      />;
  } else if (schema.type === 'string' && schema?.format === 'time') {
    inputElement =
      <DatetimeInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="time"
      />;
  } else if (schema.type === 'string' && schema?.format === 'date-time') {
    inputElement =
      <DatetimeInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
        type="date-time"
      />;
  } else if (schema.type === 'string' && schema?.widget === 'codeeditor') {
    inputElement =
      <CodeEditorInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
      />
  } else if (schema.type === 'string' && !schema.format) {
    inputElement =
      <TextInput<IWorkflowPieceData>
        name={`inputs.${itemKey}.value`}
        label={schema.title}
      />;
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

      <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
        <CheckboxInput
          name={`inputs.${itemKey}.fromUpstream`}
          defaultChecked={checkedFromUpstreamDefault}
          disabled={!checkedFromUpstreamEditable}
        />
      </Grid>
    </Box>
  );
};

export default React.memo(PieceFormItem);
