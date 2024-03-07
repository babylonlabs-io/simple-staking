import Image from "next/image";

import okx from "./okx.svg";
import { OKXWalletInfo } from "@/utils/okx_wallet";
import { trim } from "@/utils/trim";

interface ConnectProps {
  onConnect: () => void;
  wallet: OKXWalletInfo | undefined;
  btcWalletBalance: number;
}

export const Connect: React.FC<ConnectProps> = ({
  onConnect,
  wallet,
  btcWalletBalance,
}) => {
  return (
    <div className="card bg-base-300">
      <div className="card-body items-center gap-4">
        <div className="stats w-full max-w-sm">
          <div className="stat">
            <div className="stat-title">Address 🏠</div>
            <div className="stat-value text-base text-primary">
              {wallet ? trim(wallet.address) : "Not connected"}
            </div>
            <div className="stat-desc">
              {wallet?.isTaproot ? "Taproot" : "Native SegWit"}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Balance 🏦</div>
            <div className="stat-value text-base text-secondary">
              {+(btcWalletBalance / 1e8).toFixed(6)}
            </div>
            <div className="stat-desc">BTC</div>
          </div>
        </div>

        <button
          className="btn btn-primary w-full max-w-sm uppercase"
          onClick={onConnect}
          disabled={!!wallet}
        >
          <span>Connect</span>
          <Image src={okx} alt="OKX" width={40} />
        </button>
      </div>
    </div>
  );
};
