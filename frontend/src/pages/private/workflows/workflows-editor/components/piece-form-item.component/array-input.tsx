import React, { useCallback, useMemo, useState } from 'react';
import { Control, FieldArrayWithId, useFieldArray, useFormContext } from 'react-hook-form';

import { Card, CardContent, IconButton, Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { IWorkflowPieceData, InputArray } from 'context/workflows/types';
import { ArrayOption } from '../piece-form.component/upstream-options';
import TextInput from './text-input';
import SelectInput from './select-input';
import NumberInput from './number-input';
import CheckboxInput from './checkbox-input';
import DatetimeInput from './datetime-input';
import CodeEditorInput from './codeeditor-input';
import SelectUpstreamInput from './select-upstream-input';

interface ArrayInputItemProps {
  inputKey: string
  schema: any;
  control: Control<IWorkflowPieceData, any>
  definitions?: any
  upstreamOptions: ArrayOption
}

const ArrayInput: React.FC<ArrayInputItemProps> = ({ inputKey, schema, upstreamOptions, definitions, control }) => {
  const name = `inputs.${inputKey}.value` as `inputs.${string}.value`
  const { fields: data, append, remove } = useFieldArray({
    name,
    control,
  })
  const { watch } = useFormContext()
  const formsData = watch()
  const fields = data as unknown as FieldArrayWithId<InputArray>[]

  const [valuesOptions, setValuesOptions] = useState<string[]>([])

  const subItemSchema = useMemo(() => {
    let subItemSchema: any = schema?.items;
    if (schema?.items?.$ref) {
      const subItemSchemaName = schema.items.$ref.split('/').pop();
      subItemSchema = definitions?.[subItemSchemaName];
    }
    return subItemSchema
  }, [definitions, schema])

  const [checkedFromUpstreamDefault, checkedFromUpstreamEditable] = useMemo(() => {
    // from_upstream condition, if "never" or "always"
    let defaultChecked: boolean = true;
    let editable: boolean = true;
    if (subItemSchema?.from_upstream === "never") {
      defaultChecked = false;
      editable = false;
    } else if (subItemSchema?.from_upstream === "always") {
      defaultChecked = true;
      editable = false;
    }
    return [defaultChecked, editable]
  }, [subItemSchema])

  const getFromUpstream = useCallback((index: number) => {
    return formsData?.inputs?.[inputKey]?.value?.[index]?.fromUpstream
  }, [formsData?.inputs, inputKey])

  const elementType = useMemo(() => {
    if (subItemSchema?.allOf && subItemSchema.allOf.length > 0) {
      const typeClass = subItemSchema.allOf[0]['$ref'].split("/").pop();
      const valuesOptions: Array<string> = definitions?.[typeClass].enum;
      setValuesOptions(valuesOptions)
      return "SelectInput"
    } else if ((subItemSchema?.type === 'number') && !subItemSchema?.format) {
      return "NumberInput"
    } else if (subItemSchema?.type === 'integer' && !subItemSchema?.format) {
      return "NumberInputInt"
    } else if (subItemSchema?.type === 'boolean' && !subItemSchema?.format) {
      return "CheckboxInput";
    } else if (subItemSchema?.type === 'string' && !subItemSchema?.format && !subItemSchema?.widget) {
      return "TextInput";
    } else if (subItemSchema?.type === 'string' && subItemSchema?.format === 'date') {
      return "DateInput";
    } else if (subItemSchema?.type === 'string' && subItemSchema?.format === 'time') {
      return "TimeInput";
    } else if (subItemSchema?.type === 'string' && subItemSchema?.format === 'date-time') {
      return "DatetimeInput";
    } else if (subItemSchema?.type === 'string' && subItemSchema?.widget === 'codeeditor') {
      return "CodeEditorInput"
    } else if (subItemSchema?.type === 'object') {
      return "ObjectInput";
    } else {
      return "Unknown";
    }
  }, [subItemSchema, definitions])

  const handleAddInput = useCallback(() => {

    append(subItemSchema?.default)
  }, [append, subItemSchema?.default])

  return (
    <Card sx={{ width: "100%", paddingTop: 0 }}>
      <div>
        <IconButton onClick={handleAddInput} aria-label="Add" sx={{ marginRight: "16px" }}>
          <AddIcon />
        </IconButton>
        {schema?.title}
      </div>
      <CardContent  >
        {fields && fields.map((fieldWithId, index) => {
          const {id} = fieldWithId
          const fromUpstream = getFromUpstream(index)
          return (
            <Box
              key={`${inputKey}${index}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                mb: 1,
                borderLeft: "solid 1px rgba(0,0,0,0.8)",
                borderRadius: "6px",
              }}
            >
              <IconButton onClick={() => { remove(index) }} aria-label="Delete">
                <DeleteIcon />
              </IconButton>
              {fromUpstream && elementType !== "ObjectInput" && (
                <SelectUpstreamInput
                  name={`${name}.${index}`}
                  label={schema?.title}
                  options={upstreamOptions.items}
                />)}
              {!fromUpstream && elementType === "SelectInput" && (
                <SelectInput
                  key={id}
                  label={schema.title}
                  defaultValue={""}
                  name={`${name}.${index}.value`}
                  options={valuesOptions}
                />)
              }
              {!fromUpstream && elementType === "NumberInput" && (
                <NumberInput
                  key={id}
                  name={`${name}.${index}.value`}
                  type="float"
                  label={schema.title}
                  defaultValue={subItemSchema?.default ?? 10.5}
                />)
              }
              {!fromUpstream && elementType === "NumberInputInt" && (
                <NumberInput
                  key={id}
                  name={`${name}.${index}.value`}
                  type="int"
                  label={schema.title}
                  defaultValue={subItemSchema?.default ?? 10}
                />)
              }
              {!fromUpstream && elementType === "CheckboxInput" && (
                <CheckboxInput
                  key={id}
                  name={`${name}.${index}.value`}
                  label={schema.title}
                />)
              }
              {!fromUpstream && elementType === "TextInput" && (
                <TextInput
                  key={id}
                  name={`${name}.${index}.value`}
                  label={schema.title}
                />)
              }
              {!fromUpstream && elementType === "DateInput" && (
                <DatetimeInput
                  key={id}
                  name={`${name}.${index}.value`}
                  label={schema.title}
                  type="date"
                />)
              }
              {!fromUpstream && elementType === "TimeInput" && (
                <DatetimeInput
                  key={id}
                  name={`${name}.${index}.value`}
                  label={schema.title}
                  type="time"
                />)
              }
              {!fromUpstream && elementType === "DatetimeInput" && (
                <DatetimeInput
                  key={id}
                  name={`${name}.${index}.value`}
                  label={schema.title}
                  type="date-time"
                />)
              }
              {!fromUpstream && elementType === "CodeEditorInput" && (
                <CodeEditorInput
                  key={id}
                  name={`${name}.${index}.value`}
                />)
              }
              {!fromUpstream && elementType === "Unknown" && (
                <div
                  key={id}
                  style={{ color: "red", fontWeight: "bold" }}
                >
                  Unknown widget type for {subItemSchema?.title}
                </div>)
              }
              <Grid
                item xs={2}
                sx={{ display: 'flex', justifyContent: 'center', marginLeft: 2 }}
              >
                <CheckboxInput
                  name={`${name}.${index}.fromUpstream`}
                  defaultChecked={checkedFromUpstreamDefault}
                  disabled={!checkedFromUpstreamEditable}
                />
              </Grid>
            </Box>
          );

        })}
      </CardContent>
    </Card>
  );
}

export default React.memo(ArrayInput);
