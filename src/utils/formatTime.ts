import { formatDuration, intervalToDuration } from "date-fns";

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

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
