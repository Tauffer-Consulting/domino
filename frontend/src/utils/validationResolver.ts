import { useCallback } from 'react';
import { ObjectSchema, ValidationError } from 'yup';

const useYupValidationResolver = (
  validationSchema: ObjectSchema<Record<string, any>>
) =>
  useCallback(
    async (data: any) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        });

        return {
          values,
          errors: {},
        };
      } catch (errors) {
        if (errors instanceof ValidationError) {
          return {
            values: {},
            errors: errors.inner.reduce(
              (allErrors, currentError) => {
                const path = (currentError.path as string)
                  ?.replaceAll("[", ".")
                  .replaceAll("]", "")
                return {
                  ...allErrors,
                  [path]: {
                    type: currentError.type ?? 'validation',
                    message: currentError.message,
                  },
                }
              },
              {}
            ),
          };
        }

        throw new Error('Error trying to validate form schema');
      }
    },
    [validationSchema]
  );

export default useYupValidationResolver;
