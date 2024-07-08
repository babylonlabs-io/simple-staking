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

export const durationTillNow = (time: string, currentTime: number) => {
  if (!time || time.startsWith("000")) return "Ongoing";

  const duration = intervalToDuration({
    end: currentTime,
    start: new Date(time),
  });
  let format: (keyof Duration)[] = ["days", "hours", "minutes"];

  if (!duration.days && !duration.hours && !duration.minutes) {
    format.push("seconds");
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

export const timestampFormatted = (time: string) => {
  if (!time || time.startsWith("000")) return "Ongoing";

  const date = new Date(time);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
