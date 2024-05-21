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
