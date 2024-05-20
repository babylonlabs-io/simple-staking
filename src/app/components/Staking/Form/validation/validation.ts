/**
 * Validates if the value is greater than or equal to the specified minimum value.
 * @param value The value to validate.
 * @param min The minimum value allowed.
 * @param label The label for the value being validated.
 * @returns An error message if the value is less than the minimum, otherwise an empty string.
 */
export const validateMin = (value: number, min: number, label: string) => {
  if (value < min) {
    return `${label} must be at least ${min}`;
  }
  return "";
};

/**
 * Validates if the value is less than or equal to the specified maximum value.
 * @param value The value to validate.
 * @param max The maximum value allowed.
 * @param label The label for the value being validated.
 * @returns An error message if the value is greater than the maximum, otherwise an empty string.
 */
export const validateMax = (value: number, max: number, label: string) => {
  if (value > max) {
    return `${label} must be no more than ${max}`;
  }
  return "";
};

/**
 * Validates if the value is not zero.
 * @param value The value to validate.
 * @param label The label for the value being validated.
 * @returns An error message if the value is zero, otherwise an empty string.
 */
export const validateNotZero = (value: number, label: string) => {
  if (value === 0) {
    return `${label} must be greater than 0`;
  }
  return "";
};

/**
 * Validates if the value is a valid number.
 * @param value The value to validate.
 * @param label The label for the value being validated.
 * @returns An error message if the value is not a valid number, otherwise an empty string.
 */
export const validateNumber = (value: string, label: string) => {
  if (isNaN(Number(value))) {
    return `${label} must be a valid number`;
  }
  return "";
};

/**
 * Validates if the value does not have any decimal points.
 * @param value The value as a string to validate.
 * @param label The label for the value being validated.
 * @returns An error message if the value has decimal points, otherwise an empty string.
 */
export const validateNoDecimalPoints = (value: string, label: string) => {
  if (value.includes(".") || value.includes(",")) {
    return `${label} must not have decimal points`;
  }
  return "";
};

/**
 * Validates if the value has no more than 8 decimal points.
 * @param value The value to validate.
 * @param label The label for the value being validated.
 * @returns An error message if the value has more than 8 decimal points, otherwise an empty string.
 */
export const validateDecimalPoints = (value: string, label: string) => {
  const decimalPoints = value.split(".")[1]?.length || 0;
  if (decimalPoints > 8) {
    return `${label} must have no more than 8 decimal points`;
  }
  return "";
};
