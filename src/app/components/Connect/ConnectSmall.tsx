import { PiWalletBold } from "react-icons/pi";
import { FaBitcoin } from "react-icons/fa";

import { trim } from "@/utils/trim";

interface ConnectSmallProps {
  onConnect: () => void;
  address: string;
  balance: number;
}

export const ConnectSmall: React.FC<ConnectSmallProps> = ({
  onConnect,
  address,
  balance,
}) => {
  return address ? (
    <div className="mr-[-10px] flex text-sm">
      <div className="rounded-lg border border-base-200/75 p-2 pr-4">
        <div className="flex items-center gap-1">
          <FaBitcoin className="text-primary" />
          <p>
            <strong>{+(balance / 1e8).toFixed(6) || 0} BTC</strong>
          </p>
        </div>
      </div>
      <div className="relative right-[10px] rounded-lg border border-base-200 bg-base-200 p-2 dark:text-neutral-content">
        {trim(address)}
      </div>
    </div>
  ) : (
    <button
      className="btn btn-primary h-[2.5rem] min-h-[2.5rem] rounded-full px-2 text-white md:rounded-lg"
      onClick={onConnect}
      disabled={!!address}
    >
      <PiWalletBold size={20} className="flex md:hidden" />
      <span className="hidden md:flex">Connect to BTC test network</span>
    </button>
  );
};
