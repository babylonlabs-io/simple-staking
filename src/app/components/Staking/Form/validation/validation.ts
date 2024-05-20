/**
 * Validates if the value is greater than or equal to the specified minimum value.
 * @param value The value to validate.
 * @param min The minimum value allowed.
 * @returns `true` if the value is greater than or equal to the minimum, otherwise `false`.
 */
export const validateMin = (value: number, min: number): boolean => {
  return value >= min;
};

/**
 * Validates if the value is less than or equal to the specified maximum value.
 * @param value The value to validate.
 * @param max The maximum value allowed.
 * @returns `true` if the value is less than or equal to the maximum, otherwise `false`.
 */
export const validateMax = (value: number, max: number): boolean => {
  return value <= max;
};

/**
 * Validates if the value is not zero.
 * @param value The value to validate.
 * @returns `true` if the value is not zero, otherwise `false`.
 */
export const validateNotZero = (value: number): boolean => {
  return value !== 0;
};

/**
 * Validates if the value is a valid number.
 * @param value The value to validate.
 * @returns `true` if the value is a valid number, otherwise `false`.
 */
export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value));
};

/**
 * Validates if the value does not have any decimal points.
 * @param value The value as a string to validate.
 * @returns `true` if the value does not have any decimal points, otherwise `false`.
 */
export const validateNoDecimalPoints = (value: string): boolean => {
  return !value.includes(".") && !value.includes(",");
};

/**
 * Validates if the value has no more than 8 decimal points.
 * @param value The value to validate.
 * @returns `true` if the value has no more than 8 decimal points, otherwise `false`.
 */
export const validateDecimalPoints = (value: string): boolean => {
  const decimalPoints = value.split(".")[1]?.length || 0;
  return decimalPoints <= 8;
};
