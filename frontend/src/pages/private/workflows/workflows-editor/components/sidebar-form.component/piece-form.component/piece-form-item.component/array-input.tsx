import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Control, FieldArrayWithId, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Card, CardContent, IconButton, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { IWorkflowPieceData, InputArray } from 'context/workflows/types';

import TextInput from 'components/text-input';
import SelectInput from 'components/select-input';
import NumberInput from 'components/number-input';
import CheckboxInput from 'components/checkbox-input';
import DatetimeInput from 'components/datetime-input';
import CodeEditorInput from 'components/codeeditor-input';

import SelectUpstreamInput from './select-upstream-input';
import ObjectInputComponent from './object-input';
import { ArrayOption } from '../../piece-form.component/upstream-options';
import { useUpstreamCheckboxOptions } from './useUpstreamCheckboxOptions';
import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context';

interface ArrayInputItemProps {
  formId: string
  inputKey: string
  schema: any;
  control: Control<IWorkflowPieceData, any>
  definitions?: any
  upstreamOptions: ArrayOption
}

const ArrayInput: React.FC<ArrayInputItemProps> = ({ formId, inputKey, schema, upstreamOptions, definitions, control }) => {

  const name = `inputs.${inputKey}.value` as `inputs.${string}.value`
  const { fields: data, append, remove } = useFieldArray({
    name,
    control,
  })
  const fields = data as unknown as FieldArrayWithId<InputArray>[]
  const formsData = useWatch({ name })

  const { setForageWorkflowPiecesOutputSchema } = useWorkflowsEditor()

  const [enumOptions, setEnumOptions] = useState<string[]>([])

  const subItemSchema = useMemo(() => {
    let subItemSchema: any = schema?.items;
    if (schema?.items?.$ref) {
      const subItemSchemaName = schema.items.$ref.split('/').pop();
      subItemSchema = definitions?.[subItemSchemaName];
    }
    return subItemSchema
  }, [definitions, schema])

  const [checkedUpstream, disableUpstream] = useUpstreamCheckboxOptions(subItemSchema, upstreamOptions)

  const getFromUpstream = useCallback((index: number) => {
    return formsData?.[index]?.fromUpstream ?? false
  }, [formsData])

  const elementType = useMemo(() => {
    if (subItemSchema?.allOf && subItemSchema.allOf.length > 0) {
      const typeClass = subItemSchema.allOf[0]['$ref'].split("/").pop();
      const valuesOptions: Array<string> = definitions?.[typeClass].enum;
      setEnumOptions(valuesOptions)
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

    const defaultValue = [{
      fromUpstream: false,
      upstreamArgument: "",
      upstreamId: "",
      upstreamValue: "",
      value: ""
    }]

    console.log(defaultValue)

    append(defaultValue as any)
  }, [append])

  const updateOutputSchema = useCallback(async () => {
    if (schema?.items?.["$ref"] === '#/definitions/OutputModifierModel' && formsData) {
      const newProperties = formsData.reduce((acc: any, cur: { value: { type: string; name: string; description: any; }; }) => {
        let defaultValue: any = ""
        let newProperties = {}

        if (cur.value.type === "integer") {
          defaultValue = 1
        } else if (cur.value.type === "float") {
          defaultValue = 1.1
        } else if (cur.value.type === "boolean") {
          defaultValue = false
        }

        if (cur.value.type === "array") {
          newProperties = {
            [cur.value.name as string]: {
              items: {
                type: "string"
              },
              description: cur.value.description,
              title: cur.value.name,
              type: cur.value.type,
            }
          }
        } else {
          newProperties = {
            [cur.value.name as string]: {
              default: defaultValue,
              description: cur.value.description,
              title: cur.value.name,
              type: cur.value.type,
            }
          }
        }
        return { ...acc, ...newProperties }
      }, {})

      await setForageWorkflowPiecesOutputSchema(formId, newProperties)
    }
  }, [formsData, schema?.items, setForageWorkflowPiecesOutputSchema, formId])

  useEffect(() => { updateOutputSchema() }, [updateOutputSchema])

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
          const { id } = fieldWithId
          const fromUpstream = getFromUpstream(index)
          return (
            <Grid
              key={id}
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                mb: 1,
                borderLeft: "solid 1px rgba(0,0,0,0.8)",
                borderRadius: "6px",
              }}
            >
              <Grid
                item
                xs={1}
              >
                <IconButton onClick={() => { remove(index) }} aria-label="Delete">
                  <DeleteIcon />
                </IconButton>
              </Grid>


              {fromUpstream && elementType !== "ObjectInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <SelectUpstreamInput
                    name={`${name}.${index}`}
                    label={schema?.title}
                    options={upstreamOptions.items}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "SelectInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <SelectInput
                    label={schema.title}
                    emptyValue
                    defaultValue={""}
                    name={`${name}.${index}.value`}
                    options={enumOptions}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "NumberInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <NumberInput
                    name={`${name}.${index}.value`}
                    type="float"
                    label={schema.title}
                    defaultValue={subItemSchema?.default ?? 10.5}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "NumberInputInt" && (
                <Grid
                  item
                  xs={9}
                >
                  <NumberInput
                    name={`${name}.${index}.value`}
                    type="int"
                    label={schema.title}
                    defaultValue={subItemSchema?.default ?? 10}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "CheckboxInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <CheckboxInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "TextInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <TextInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "DateInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <DatetimeInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                    type="date"
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "TimeInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <DatetimeInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                    type="time"
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "DatetimeInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <DatetimeInput
                    name={`${name}.${index}.value`}
                    label={schema.title}
                    type="date-time"
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "CodeEditorInput" && (
                <Grid
                  item
                  xs={9}
                >
                  <CodeEditorInput
                    name={`${name}.${index}.value`}
                  />
                </Grid>
              )}
              {!fromUpstream && elementType === "Unknown" && (
                <Grid
                  item
                  xs={9}
                >
                  <div
                    style={{ color: "red", fontWeight: "bold" }}
                  >
                    Unknown widget type for {subItemSchema?.title}
                  </div>
                </Grid>
              )}

              {elementType !== "ObjectInput" && (
                <Grid item xs={1}>
                  <CheckboxInput
                    name={`${name}.${index}.fromUpstream`}
                    defaultChecked={checkedUpstream}
                    disabled={disableUpstream}
                  />
                </Grid>
              )}

              {elementType === "ObjectInput" && (
                <Grid item xs={11}>
                  <ObjectInputComponent
                    name={`${name}.${index}`}
                    schema={schema}
                    definitions={definitions}
                    upstreamOptions={upstreamOptions.items}
                    checkedFromUpstreamDefault={checkedUpstream}
                    checkedFromUpstreamEditable={disableUpstream}
                  />
                </Grid>
              )}

            </Grid>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default React.memo(ArrayInput);
