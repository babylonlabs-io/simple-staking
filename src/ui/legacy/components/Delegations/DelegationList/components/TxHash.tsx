import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { trim } from "@/ui/legacy/utils/trim";

const { mempoolApiUrl } = getNetworkConfigBTC();

interface TxHashProps {
  value: string;
}

export function TxHash({ value }: TxHashProps) {
  if (!value) return <span>-</span>;

  return (
    <a
      href={`${mempoolApiUrl}/tx/${value}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-primary hover:underline"
    >
      {trim(value) ?? value}
    </a>
  );
}
