import { getNetworkConfig } from "@/config/network.config";
import { trim } from "@/utils/trim";

const { mempoolApiUrl } = getNetworkConfig();

interface TxHashProps {
  value: string;
}

export function TxHash({ value }: TxHashProps) {
  return (
    <a
      href={`${mempoolApiUrl}/tx/${value}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {trim(value)}
    </a>
  );
}
