import { getNetworkConfig } from "@/config/network.config";

interface ControlsProps {
  onStaking: () => void;
  onConnect: () => void;
  address: string;
}

export const Controls: React.FC<ControlsProps> = ({
  onStaking,
  onConnect,
  address,
}) => {
  const { coinName } = getNetworkConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-1 md:col-span-3 border-l border-b border-es-border flex items-center">
        <p className="text-es-text ml-11 text-md">
          {!!address
            ? 'Press "Stake more" to increase your staking amount'
            : 'Press "Connect" to connect wallet'}
        </p>
      </div>

      <div className="col-span-1">
        <button
          className="border-es-accent border font-medium text-3xl text-center h-20 w-full text-es-black bg-es-accent md:hover:bg-es-black md:hover:text-es-accent md:transition-colors disabled:opacity-70"
          onClick={!!address ? onStaking : onConnect}
        >
          {!!address ? "STAKE MORE" : "CONNECT"}
        </button>
      </div>
    </div>
  );
};
