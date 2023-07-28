import React from 'react';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';

interface Props<T> {
  label: string
  name: Path<T>
  type?: "time" | "date" | "date-time"
}

function DatetimeInput<T extends FieldValues>({ label, name, type = "date" }: Props<T>) {

  const { control } = useFormContext()

  const defaultValue = new Date().toISOString()

  switch (type) {
    case "date-time":
      return <Controller
        name={name}
        control={control}
        defaultValue={dayjs(defaultValue as string, 'YYYY-MM-DD HH:mm') as any}
        render={({ field: { onChange, value, ...rest } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DateTimePicker']}>
              <DateTimePicker
                label={label}
                ampm={false}
                format='DD/MM/YYYY HH:mm'
                value={dayjs(value as string, 'YYYY-MM-DD HH:mm')}
                onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD HH:mm') as any) }}
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
        defaultValue={dayjs(defaultValue as string, 'HH:mm') as any}
        render={({ field: { onChange, value, ...rest } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['TimePicker']} sx={{ width: "100%" }} >
              <TimePicker
                ampm={false}
                label={label}
                format='HH:mm'
                sx={{ width: "100%" }}
                value={dayjs(value as string, 'HH:mm')}
                onChange={(e) => { onChange(dayjs(e).format('HH:mm') as any) }}
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
        defaultValue={dayjs(defaultValue as string, 'YYYY-MM-DD') as any}
        render={({ field: { value, onChange, ...rest } }) => (
          <DemoContainer components={['DatePicker']} sx={{ width: "100%" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={label}
                views={['day', 'month', 'year']}
                format="DD/MM/YYYY"
                sx={{ width: "100%" }}
                value={dayjs(value as string, 'YYYY-MM-DD')}
                onChange={(e) => { onChange(dayjs(e).format('YYYY-MM-DD') as any) }}
                {...rest}
              />
            </LocalizationProvider>
          </DemoContainer>
        )}
      />;
  }
}

export default DatetimeInput;
