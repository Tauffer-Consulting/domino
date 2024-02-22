import { FormHelperText } from "@mui/material";
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
import { fetchFromObject } from "utils";

interface Props<T> {
  label: string;
  name: Path<T>;
  type?: "time" | "date" | "date-time";
  defaultValue?: string | null;
}

function DatetimeInput<T extends FieldValues>({
  label,
  name,
  type = "date",
  defaultValue = null,
}: Props<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = fetchFromObject(errors, name);

  switch (type) {
    case "date-time": {
      const defaultDateTime =
        typeof defaultValue === "string"
          ? dayjs(new Date(defaultValue), "YYYY-MM-DD HH:mm")
          : defaultValue;

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
                  value={value ? dayjs(value) : null}
                  onChange={(e) => {
                    e?.isValid() ? onChange(e.toISOString()) : onChange(null);
                  }}
                  slotProps={{
                    textField: {
                      error: !!error,
                      helperText: (
                        <FormHelperText error>{error?.message}</FormHelperText>
                      ),
                    },
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
      const defaultTime =
        typeof defaultValue === "string"
          ? dayjs(defaultValue, "HH:mm")
          : defaultValue;

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
                  value={value ? dayjs(value as string, "HH:mm") : null}
                  onChange={(e) => {
                    e?.isValid()
                      ? onChange(dayjs(e).format("HH:mm") as any)
                      : onChange(null);
                  }}
                  slotProps={{
                    textField: {
                      error: !!error,
                      helperText: (
                        <FormHelperText error>{error?.message}</FormHelperText>
                      ),
                    },
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
      const defaultDate =
        typeof defaultValue === "string"
          ? dayjs(defaultValue, "YYYY-MM-DD")
          : defaultValue;

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
                  value={value ? dayjs(value as string) : null}
                  onChange={(e) => {
                    e?.isValid()
                      ? onChange(dayjs(e).format("YYYY-MM-DD") as any)
                      : onChange(null);
                  }}
                  slotProps={{
                    textField: {
                      error: !!error,
                      helperText: (
                        <FormHelperText error>{error?.message}</FormHelperText>
                      ),
                    },
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
