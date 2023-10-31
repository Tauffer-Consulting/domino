import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import React from "react";
import {
  Controller,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";

interface Props<T> {
  label: string;
  name: Path<T>;
  type?: "time" | "date" | "date-time";
  defaultValue?: Date;
}

function DatetimeInput<T extends FieldValues>({
  label,
  name,
  type = "date",
  defaultValue = new Date(),
}: Props<T>) {
  const { control } = useFormContext();

  switch (type) {
    case "date-time": {
      const defaultDateTime = dayjs(
        defaultValue ?? new Date(),
        "YYYY-MM-DD HH:mm",
      );

      return (
        <Controller
          name={name}
          control={control}
          defaultValue={defaultDateTime as any}
          render={({ field: { onChange, value, ...rest } }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                  label={label}
                  ampm={false}
                  format="DD/MM/YYYY HH:mm"
                  value={dayjs(value)}
                  onChange={(e) => {
                    e?.isValid() ? onChange(e.toISOString()) : onChange(null);
                  }}
                  {...rest}
                />
              </DemoContainer>
            </LocalizationProvider>
          )}
        />
      );
    }
    case "time": {
      const defaultTime = dayjs(defaultValue ?? new Date(), "HH:mm");

      return (
        <Controller
          name={name}
          control={control}
          defaultValue={dayjs(defaultTime, "HH:mm") as any}
          render={({ field: { onChange, value, ...rest } }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]} sx={{ width: "100%" }}>
                <TimePicker
                  ampm={false}
                  label={label}
                  format="HH:mm"
                  sx={{ width: "100%" }}
                  value={dayjs(value as string, "HH:mm")}
                  onChange={(e) => {
                    onChange(dayjs(e).format("HH:mm") as any);
                  }}
                  {...rest}
                />
              </DemoContainer>
            </LocalizationProvider>
          )}
        />
      );
    }
    case "date":
    default:
      // eslint-disable-next-line no-case-declarations
      const defaultDate = dayjs(defaultValue ?? new Date(), "YYYY-MM-DD");

      return (
        <Controller
          name={name}
          control={control}
          defaultValue={dayjs(defaultDate, "YYYY-MM-DD") as any}
          render={({ field: { value, onChange, ...rest } }) => (
            <DemoContainer components={["DatePicker"]} sx={{ width: "100%" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={label}
                  views={["day", "month", "year"]}
                  format="DD/MM/YYYY"
                  sx={{ width: "100%" }}
                  value={dayjs(value as string)}
                  onChange={(e) => {
                    onChange(dayjs(e).format("YYYY-MM-DD") as any);
                  }}
                  {...rest}
                />
              </LocalizationProvider>
            </DemoContainer>
          )}
        />
      );
  }
}

export default DatetimeInput;
