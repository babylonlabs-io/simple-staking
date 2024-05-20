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

export const blocksToTime = (
  blocks: number,
  unit: keyof Duration = "years",
) => {
  if (!blocks) return "-";

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
      value = 0;
  }

  return `${Math.floor(value)} ${unit}`;
};
