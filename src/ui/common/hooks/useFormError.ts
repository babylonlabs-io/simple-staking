// Removed unused React import to avoid triggering the TypeScript `noUnusedLocals` rule.

import { useFormState } from "@babylonlabs-io/core-ui";

import { useMultistakingState } from "../state/MultistakingState";

interface FieldError {
  field: string;
  message: string;
  level: "error" | "warning" | "default";
}

export function useFormError(): FieldError | undefined {
  const { errors } = useFormState();
  const { formFields } = useMultistakingState();

  const fieldErrors = formFields
    .map(({ field, errors: errorOptions }) => {
      const error = errors[field];

      return error
        ? {
            field,
            message: error.message as string,
            level: errorOptions?.[error.type as string]?.level ?? "default",
          }
        : null;
    })
    .filter(Boolean) as FieldError[];

  return fieldErrors[0];
}
