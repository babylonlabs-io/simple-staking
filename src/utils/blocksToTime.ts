// Define an interface to represent the different duration units
interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

// Constants for conversion factors
const BLOCKS_PER_HOUR = 6;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;

/**
 * Converts a number of blocks into a specified time unit.
 *
 * @param {number} blocks - The number of blocks to convert.
 * @param {keyof Duration} [unit] - The unit to convert the blocks into. If not provided, returns the number of blocks.
 * @returns {string} - The converted time in the specified unit, or the number of blocks if no unit is provided. Returns "-" for unrecognized units.
 *
 * Examples of usage:
 * blocksToTime(1000); // "1000 blocks"
 * blocksToTime(1000, "years"); // "0 years"
 * blocksToTime(20000, "months"); // "27 months"
 * blocksToTime(30000, "weeks"); // "119 weeks"
 * blocksToTime(15000, "days"); // "104 days"
 * blocksToTime(500, "hours"); // "83 hours"
 * blocksToTime(250, "minutes"); // "2500 minutes"
 * blocksToTime(100, "seconds"); // "60000 seconds"
 * blocksToTime(10000, "invalidUnit"); // "-"
 */
export const blocksToTime = (blocks: number, unit?: keyof Duration) => {
  if (!blocks) return "-";

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

  // Return the calculated value rounded down to the nearest integer, followed by the unit
  // If the value is NaN, return "-"
  return isNaN(value) ? "-" : `${Math.floor(value)} ${unit}`;
};
