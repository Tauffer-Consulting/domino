import { useCallback } from 'react';
import { object, ValidationError } from 'yup';

const useYupValidationResolver = (
  validationSchema: ReturnType<typeof object>
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
        if (errors instanceof ValidationError)
          return {
            values: {},
            errors: errors.inner.reduce(
              (allErrors, currentError) => ({
                ...allErrors,
                [currentError.path!]: {
                  type: currentError.type ?? 'validation',
                  message: currentError.message,
                },
              }),
              {}
            ),
          };

        throw new Error('Error trying to validate form schema');
      }
    },
    [validationSchema]
  );

export default useYupValidationResolver;