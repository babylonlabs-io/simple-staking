import {
  add,
  differenceInCalendarDays,
  differenceInWeeks,
  formatDistanceStrict,
  formatDuration,
  intervalToDuration,
} from "date-fns";

const BLOCKS_PER_HOUR = 6;
const WEEKS_PRECISION = 5;
const DAY_TO_WEEK_DISPLAY_THRESHOLD = 30;

/**
 * Converts a number of blocks into days or weeks
 * Returns the time in days if the difference is less than 7 days
 * Otherwise, returns the time in weeks
 *
 * @param {number | undefined} blocks - The number of blocks to convert.
 * @returns {string} - The converted time in days or weeks.
 * Rounded to 5 weeks if the difference is greater than 7 days.
 *
 * Examples of usage:
 * blocksToDisplayTime(30000); // "29 weeks"
 * blocksToDisplayTime(1); // "1 day"
 * blocksToDisplayTime(200); // "2 days"
 */
export const blocksToDisplayTime = (blocks: number | undefined): string => {
  // If no blocks are provided, return default value
  if (!blocks) return "-";

  // Calculate the equivalent time in hours
  const hours = blocks / BLOCKS_PER_HOUR;

  // Calculate the start and end dates
  // get the timestamp now
  const startDate = new Date();
  const endDate = add(startDate, { hours });

  const dayDifference = differenceInCalendarDays(endDate, startDate);
  // If the difference is greater than or equal to 30 days, return the difference in weeks
  if (dayDifference >= DAY_TO_WEEK_DISPLAY_THRESHOLD) {
    // Calculate the difference in weeks
    const weeks = differenceInWeeks(endDate, startDate, {
      roundingMethod: "ceil",
    });
    const roundedWeeks = Math.round(weeks / WEEKS_PRECISION) * WEEKS_PRECISION;
    return `${roundedWeeks} weeks`;
  }

  // Otherwise, return the difference in days and round up to the nearest day
  return formatDistanceStrict(startDate, endDate, {
    unit: "day",
    roundingMethod: "ceil",
  });
};

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

/**
 * Returns the duration between the start timestamp and the current time
 *
 * @param {string} startTimestamp - The start timestamp.
 * @param {number} currentTime - The current time.
 * @returns {string} - The duration between the start timestamp and the current time.
 */
export const durationTillNow = (
  startTimestamp: string,
  currentTime: number,
) => {
  if (!startTimestamp || startTimestamp.startsWith("000")) return "Ongoing";

  const duration = intervalToDuration({
    end: currentTime,
    start: new Date(startTimestamp),
  });

  let format: (keyof Duration)[] = [];

  // If there are months or years, only show months and days
  if (duration.months || duration.years) {
    format = ["years", "months", "days"];
  }
  // If only days or less, show more detailed time
  else {
    format = ["days", "hours", "minutes"];
    // Add seconds only if less than a minute
    if (!duration.days && !duration.hours && !duration.minutes) {
      format.push("seconds");
    }
  }

  const formattedTime = formatDuration(duration, {
    format,
  });
  if (formattedTime) {
    return `${formattedTime} ago`;
  } else {
    return "Just now";
  }
};

/**
 * Formats the time remaining until a future completion time
 *
 * @param {string} completionTime - The completion timestamp (ISO string).
 * @returns {string} - The formatted time remaining (e.g., "2 hours 30 minutes" or "45 minutes").
 */
export const formatTimeRemaining = (completionTime: string): string => {
  const now = new Date();
  const completion = new Date(completionTime);

  if (completion <= now) {
    return "0 minutes";
  }

  const duration = intervalToDuration({
    start: now,
    end: completion,
  });

  const formatted = formatDuration(duration, {
    format: ["hours", "minutes"],
  });
  return formatted === "" ? "< 1 minute" : formatted;
};
