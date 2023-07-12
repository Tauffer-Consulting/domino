import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { useWorkflowsEditor } from 'context/workflows/workflows-editor.context'
import ArrayInputItem from '../piece-form-arrayinput-item.component';
import CodeEditorItem from '../piece-form-codeeditor-item.component';
import { UseFormRegister, Control, Controller, useFormContext } from 'react-hook-form';
import { IInput, IWorkflowPieceData } from 'context/workflows/types';


interface PieceFormItemProps {
  formId: string;
  schema: any;
  itemKey: string;
  inputProperties: IInput;
  register: UseFormRegister<IWorkflowPieceData>
  control: Control<IWorkflowPieceData, any>
  definitions?: any
  upstreamOptions: string[]
}

const PieceFormItem: React.FC<PieceFormItemProps> = ({ formId, upstreamOptions, itemKey, inputProperties, schema, definitions, register, control }) => {
  const [checkedFromUpstream, setCheckedFromUpstream] = useState(false)
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

  const { setValue } = useFormContext()

  const handleCheckFromUpstream = useCallback((value: boolean, cb: (e: boolean) => void) => {
    if (value === false) {
      setValue(`inputs.${itemKey}.value`, schema?.default)
    }

    setCheckedFromUpstream(value);
    cb(value)
  }, [setCheckedFromUpstream])

  if (!inputProperties || !Object.keys(inputProperties).length) {
    return null
  }

  let inputElement: React.ReactNode = null

  if (checkedFromUpstream && upstreamOptions.length) {
    inputElement = (
      <FormControl fullWidth>
        <InputLabel>{schema?.title}</InputLabel>
        <Select
          fullWidth
          defaultValue={upstreamOptions[0]}
          {...register(`inputs.${itemKey}.value`)}
        >
          {upstreamOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  } else if (schema?.allOf && schema.allOf.length > 0) {
    const typeClass = schema.allOf[0]['$ref'].split("/").pop();
    const valuesOptions: Array<string> = definitions?.[typeClass].enum;
    inputElement =
      <FormControl fullWidth>
        <InputLabel>{itemKey}</InputLabel>
        <Select
          defaultValue={schema?.default ?? ""}
          {...register(`inputs.${itemKey}.value`)}
        >
          {valuesOptions.map((option: string) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>;
  } else if ((schema.type === 'number') && !schema.format) {
    inputElement =
      <TextField
        fullWidth
        variant="outlined"
        type="number"
        label={schema.title}
        inputProps={{
          step: 0.1,
        }}
        {...register(`inputs.${itemKey}.value`, {
          valueAsNumber: true,
        })}
      />;
  } else if (schema.type === 'integer' && !schema.format) {
    inputElement =
      <TextField
        fullWidth
        variant="outlined"
        type="number"
        label={schema.title}
        {...register(`inputs.${itemKey}.value`, {
          valueAsNumber: true,
        })}
      />;
  } else if (schema.type === 'boolean' && !schema.format) {
    inputElement =
      <FormControlLabel
        control={
          <Controller
            name={`inputs.${itemKey}.value`}
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                checked={!!field.value}
                onChange={(e) => field.onChange(!!e.target.checked)}
              />
            )}
          />
        }
        labelPlacement="start"
        label={schema.title}
      />;
  } else if (schema.type === 'string' && schema.format === 'date') {
    inputElement =
      <Controller
        name={`inputs.${itemKey}.value`}
        control={control}
        defaultValue={dayjs(inputProperties.value as string, 'YYYY-MM-DD')}
        render={({ field: { value, onChange, ...rest } }) => (
          <DemoContainer components={['DatePicker']} sx={{ width: "100%" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={schema.title}
                views={['day', 'month', 'year']}
                format="DD/MM/YYYY"
                sx={{ width: "100%" }}
                value={dayjs(value as string, 'YYYY-MM-DD')}
                onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD')) }}
                {...rest}
              />
            </LocalizationProvider>
          </DemoContainer>
        )}
      />;
  } else if (schema.type === 'string' && schema?.format === 'time') {
    inputElement =
      <Controller
        name={`inputs.${itemKey}.value`}
        control={control}
        defaultValue={dayjs(inputProperties.value as string, 'HH:mm')}
        render={({ field: { onChange, value, ...rest } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']} sx={{ width: "100%" }} >
              <TimePicker
                ampm={false}
                label={schema.title}
                format='HH:mm'
                sx={{ width: "100%" }}
                // value={new Date(`1970-01-01T${value}:00`)}  // this trick is necessary to properly parse only time
                value={dayjs(value as string, 'HH:mm')}
                onChange={(e) => { onChange(dayjs(e).format('HH:mm')) }}
                {...rest}
              />
            </DemoContainer>
          </LocalizationProvider>
        )}
      />;
  } else if (schema.type === 'string' && schema?.format === 'date-time') {
    inputElement =
      <Controller
        name={`inputs.${itemKey}.value`}
        control={control}
        defaultValue={dayjs(inputProperties.value as string, 'YYYY-MM-DDTHH:mm')}
        render={({ field: { onChange, value, ...rest } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker
                label={schema.title}
                ampm={false}
                format='DD/MM/YYYY hh:mm'

                value={dayjs(value as string, 'YYYY-MM-DD HH:mm')}
                onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD HH:mm')) }}
                {...rest}
              />
            </DemoContainer>
          </LocalizationProvider>
        )}
      />;
  }
  else if (schema.type === 'string' && schema?.widget === 'codeeditor') {
    inputElement =
      <Controller
        name={`inputs.${itemKey}.value`}
        render={({ field }) => (
          <CodeEditorItem
            {...field}
          />
        )}
      />;
  } else if (schema.type === 'string' && !schema.format) {
    inputElement =
      <TextField
        fullWidth
        multiline
        variant="outlined"
        label={schema.title}
        {...register(`inputs.${itemKey}.value`)}
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
      {checkedFromUpstreamAllowed ? (
        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Controller
            name={`inputs.${itemKey}.fromUpstream`}
            control={control}
            defaultValue={inputProperties.fromUpstream}
            render={({ field }) => (
              <Checkbox
                {...field}
                disabled={!checkedFromUpstreamEditable || !upstreamOptions.length}
                checked={field.value ?? false}
                onChange={(e) => handleCheckFromUpstream(e.target.checked, field.onChange)}
              />
            )}

          />
        </Grid>
      ) : null}
    </Box>
  );
};

export default PieceFormItem;
