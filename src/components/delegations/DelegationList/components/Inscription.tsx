import { durationTillNow } from "@/utils/time";

interface Inscription {
  value: string;
}

export function Inscription({ value }: Inscription) {
  const currentTime = Date.now();
  return (
    <div className="order-3 lg:order-1">
      {durationTillNow(value, currentTime)}
    </div>
  );
}
