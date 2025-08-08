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
 * Converts a full duration string to compact format (e.g. "2 hours 30 minutes ago" -> "2h 30m ago")
 * @param {string} full - The full duration string to compact
 * @returns {string} - The compacted duration string
 */
export const compactDuration = (full: string): string => {
  const parts = full.replace(/ ago$/, "").split(" ");
  const compactParts: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const value = parts[i];
    const unit = parts[i + 1] ?? "";
    const abbr = unit.startsWith("year")
      ? "y"
      : unit.startsWith("month")
        ? "mo"
        : unit.startsWith("week")
          ? "w"
          : unit.startsWith("day")
            ? "d"
            : unit.startsWith("hour")
              ? "h"
              : unit.startsWith("minute")
                ? "m"
                : unit.startsWith("second")
                  ? "s"
                  : unit;
    compactParts.push(`${value}${abbr}`);
  }
  return compactParts.join(" ") + " ago";
};

/**
 * Formats time remaining until a future date in compact format (e.g. "2h 30m" or "45m")
 * @param {string} completionTime - The completion time as an ISO string
 * @returns {string} - The formatted time remaining
 */
export const formatTimeRemaining = (completionTime: string): string => {
  const now = new Date();
  const completion = new Date(completionTime);
  const diffMs = completion.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "0h 0m";
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Returns the duration between the start timestamp and the current time
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
