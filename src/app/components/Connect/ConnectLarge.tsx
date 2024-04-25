import Image from "next/image";

import icon from "./connect-icon.svg";

interface ConnectLargeProps {
  onConnect: () => void;
}

export const ConnectLarge: React.FC<ConnectLargeProps> = ({ onConnect }) => {
  return (
    <div className="flex justify-center">
      <button
        className="gradient-primary border-gradient-primary flex w-full flex-col items-center gap-3 rounded-xl border-2 border-primary px-10 py-5 shadow-sm shadow-primary md:w-auto"
        onClick={onConnect}
      >
        <div className="rounded-full bg-primary p-2">
          <Image src={icon} alt="Connect wallet" />
        </div>
        <p>Connect your wallet to stake Bitcoin</p>
      </button>
    </div>
  );
};
