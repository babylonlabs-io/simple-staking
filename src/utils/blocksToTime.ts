interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const BLOCKS_PER_HOUR = 6;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;

/**
 * Converts a number of blocks into a specified time unit with optional rounding precision.
 *
 * @param {number} blocks - The number of blocks to convert.
 * @param {keyof Duration} [unit] - The unit to convert the blocks into. If not provided, returns the number of blocks.
 * @param {number} [precision] - The precision to round the result to. If not provided, the result is not rounded.
 * @returns {string} - The converted time in the specified unit, or the number of blocks if no unit is provided. Returns "-" for unrecognized units.
 *
 * Examples of usage:
 * blocksToTime(1000); // "1000 blocks"
 * blocksToTime(1000, "years"); // "0 years"
 * blocksToTime(20000, "months"); // "4 months"
 * blocksToTime(30000, "weeks"); // "29 weeks"
 * blocksToTime(15000, "days"); // "104 days"
 * blocksToTime(500, "hours"); // "83 hours"
 * blocksToTime(250, "minutes"); // "2500 minutes"
 * blocksToTime(100, "seconds"); // "60000 seconds"
 * blocksToTime(10000, "invalidUnit"); // "-"
 * blocksToTime(64000, "weeks", 5); // "65 weeks" instead of "63 weeks"
 */
export const blocksToTime = (
  blocks: number,
  unit?: keyof Duration,
  precision?: number,
): string => {
  // If no blocks are provided, return "-"
  if (!blocks) return "-";

  // If no unit is provided, return the number of blocks
  if (!unit) return `${blocks}`;

  // Convert blocks to different time units based on the average blocks per hour
  const hours = blocks / BLOCKS_PER_HOUR;
  const days = hours / HOURS_IN_DAY;
  const weeks = days / DAYS_IN_WEEK;
  const months = days / DAYS_IN_MONTH;
  const years = days / DAYS_IN_YEAR;
  const minutes = hours * MINUTES_IN_HOUR;
  const seconds = minutes * SECONDS_IN_MINUTE;

  let value: number;

  switch (unit) {
    case "years":
      value = years;
      break;
    case "months":
      value = months;
      break;
    case "weeks":
      value = weeks;
      break;
    case "days":
      value = days;
      break;
    case "hours":
      value = hours;
      break;
    case "minutes":
      value = minutes;
      break;
    case "seconds":
      value = seconds;
      break;
    default:
      // If the unit is not recognized, set the value to NaN
      value = NaN;
  }

  // Round the value to the nearest multiple of precision, if precision is provided
  if (precision) {
    value = Math.round(value / precision) * precision;
  }

  // Return the calculated value rounded to the nearest integer, followed by the unit
  // If the value is NaN, return "-"
  return isNaN(value) ? "-" : `${Math.floor(value)} ${unit}`;
};
