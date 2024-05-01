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

export const durationTillNow = (time: string) => {
  if (!time || time.startsWith("000")) return "Ongoing";

  const duration = intervalToDuration({
    end: Date.now(),
    start: new Date(time),
  });
  let format: (keyof Duration)[] = ["days", "hours", "minutes"];

  if (!duration.days && !duration.hours && !duration.minutes) {
    format.push("seconds");
  }

  const formattedTime = formatDuration(duration, {
    format,
  });

  return `${formattedTime} ago`;
};

export const durationTillNowUnix = (time: number) => {
  if (!time) return "Ongoing";

  const duration = intervalToDuration({
    start: Date.now(),
    end: new Date(time),
  });
  let format: (keyof Duration)[] = ["days", "hours", "minutes"];

  if (!duration.days && !duration.hours && !duration.minutes) {
    if (!duration.seconds) {
      return "now";
    } else {
      format.push("seconds");
    }
  }

  const formattedTime = formatDuration(duration, {
    format,
  });

  return `${formattedTime} ago`;
};
