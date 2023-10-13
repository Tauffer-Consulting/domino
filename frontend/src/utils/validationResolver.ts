import { type FieldErrors, type FieldValues } from "react-hook-form";
import { type ObjectSchema, ValidationError } from "yup";

const isNullOrUndefined = (value: unknown): value is null | undefined =>
  value == null;

const isObjectType = (value: unknown) => typeof value === "object";

const isDateObject = (value: unknown): value is Date => value instanceof Date;

const isObject = <T extends object>(value: unknown): value is T =>
  !isNullOrUndefined(value) &&
  !Array.isArray(value) &&
  isObjectType(value) &&
  !isDateObject(value);

function compact<TValue>(value: TValue[]) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function stringToPath(input: string): string[] {
  return compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
}

function isKey(value: string) {
  return /^\w*$/.test(value);
}

function set(object: FieldValues, path: string, value?: unknown) {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+tempPath[index + 1])
          ? []
          : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
}

const toNestError = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
): FieldErrors => {
  const fieldErrors: FieldErrors<TFieldValues> = {};
  for (const path in errors) {
    set(fieldErrors, path, Object.assign(errors[path] ?? {}));
  }

  return fieldErrors;
};

export const yupResolver =
  (validationSchema: ObjectSchema<Record<string, any>>) =>
  async (data: any) => {
    try {
      const values = await validationSchema.validate(data, {
        abortEarly: false,
      });

      return {
        values,
        errors: {},
      };
    } catch (e) {
      if (e instanceof ValidationError) {
        const errors = e.inner.reduce((allErrors, currentError) => {
          const path = (currentError.path as string)
            ?.replaceAll("[", ".")
            .replaceAll("]", "");
          return {
            ...allErrors,
            [path]: {
              type: currentError.type ?? "validation",
              message: currentError.message,
            },
          };
        }, {});

        return {
          values: {},
          errors: toNestError(errors),
        };
      }

      throw new Error("Error trying to validate form schema");
    }
  };
