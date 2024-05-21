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

export const blocksToTime = (blocks: number) => {
  if (!blocks) throw new Error("No blocks provided.");

  const averageBlockTime = 10;
  const amountSeconds = blocks * averageBlockTime * 60 * 1000;

  const duration = intervalToDuration({
    start: 0,
    end: amountSeconds,
  });
  let format: (keyof Duration)[] = [
    "years",
    "months",
    "days",
    "hours",
    "minutes",
  ];

  const formattedTime = formatDuration(duration, {
    format,
  });

  return `${formattedTime}`;
};
