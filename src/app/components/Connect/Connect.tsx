import { trim } from "@/utils/trim";
import { isTaproot } from "@/utils/wallet";

interface ConnectProps {
  onConnect: () => void;
  address: string;
  balance: number;
}

export const Connect: React.FC<ConnectProps> = ({
  onConnect,
  address,
  balance,
}) => {
  return (
    <div className="card bg-base-300">
      <div className="card-body items-center gap-4">
        <div className="stats w-full max-w-sm">
          <div className="stat">
            <div className="stat-title">Address 🏠</div>
            <div className="stat-value text-base text-primary">
              {address ? trim(address) : "Not connected"}
            </div>
            <div className="stat-desc">
              {isTaproot(address) ? "Taproot" : "Native SegWit"}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Balance 🏦</div>
            <div className="stat-value text-base text-secondary">
              {+(balance / 1e8).toFixed(6)}
            </div>
            <div className="stat-desc">BTC</div>
          </div>
        </div>

        <button
          className="btn btn-primary w-full max-w-sm uppercase"
          onClick={onConnect}
          disabled={!!address}
        >
          <span>Connect</span>
        </button>
      </div>
    </div>
  );
};
