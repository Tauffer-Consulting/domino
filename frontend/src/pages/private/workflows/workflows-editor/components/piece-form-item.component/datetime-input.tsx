import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { IWorkflowPieceData } from 'context/workflows/types';

interface Props {
  label: string
  name: `inputs.${string}.value`
  type?: "time" | "date" | "date-time"
}

const DatetimeInput: React.FC<Props> = ({ label, name, type = "date" }) => {

  const { control } = useFormContext<IWorkflowPieceData>()

  const defaultValue = new Date().toISOString()

  switch (type) {
    case "date-time":
      return <Controller
        name={name}
        control={control}
        defaultValue={dayjs(defaultValue as string, 'YYYY-MM-DD HH:mm')}
        render={({ field: { onChange, value, ...rest } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker
                label={label}
                ampm={false}
                format='DD/MM/YYYY HH:mm'
                value={dayjs(value as string, 'YYYY-MM-DD HH:mm')}
                onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD HH:mm')) }}
                {...rest}
              />
            </DemoContainer>
          </LocalizationProvider>
        )}
      />;
    case 'time':
      return <Controller
        name={name}
        control={control}
        defaultValue={dayjs(defaultValue as string, 'HH:mm')}
        render={({ field: { onChange, value, ...rest } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']} sx={{ width: "100%" }} >
              <TimePicker
                ampm={false}
                label={label}
                format='HH:mm'
                sx={{ width: "100%" }}
                value={dayjs(value as string, 'HH:mm')}
                onChange={(e) => { onChange(dayjs(e).format('HH:mm')) }}
                {...rest}
              />
            </DemoContainer>
          </LocalizationProvider>
        )}
      />;
    case 'date':
    default:
      return <Controller
        name={name}
        control={control}
        defaultValue={dayjs(defaultValue as string, 'YYYY-MM-DD')}
        render={({ field: { value, onChange, ...rest } }) => (
          <DemoContainer components={['DatePicker']} sx={{ width: "100%" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={label}
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
  }
}

export default React.memo(DatetimeInput);
