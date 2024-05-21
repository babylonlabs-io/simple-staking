import { add, differenceInWeeks } from "date-fns";

const BLOCKS_PER_HOUR = 6;

/**
 * Converts a number of blocks into weeks with optional rounding precision.
 *
 * @param {number} blocks - The number of blocks to convert.
 * @param {number} [precision] - The precision to round the result to. If not provided, the result is not rounded.
 * @returns {string} - The converted time in weeks, rounded to the specified precision.
 *
 * Examples of usage:
 * blocksToWeeks(30000); // "29 weeks"
 * blocksToWeeks(63000, 5); // "65 weeks"
 */
export const blocksToWeeks = (blocks: number, precision?: number): string => {
  // If no blocks are provided, return "-"
  if (!blocks) return "-";

  // Calculate the equivalent time in hours
  const hours = blocks / BLOCKS_PER_HOUR;

  // Calculate the start and end dates
  const startDate = new Date(0);
  const endDate = add(startDate, { hours });

  // Calculate the difference in weeks
  const weeks = differenceInWeeks(endDate, startDate);

  // Round the value to the nearest multiple of precision, if precision is provided
  let roundedWeeks = weeks;
  if (precision) {
    roundedWeeks = Math.round(weeks / precision) * precision;
  }

  // Return the calculated value, followed by the unit
  return `${roundedWeeks} weeks`;
};
