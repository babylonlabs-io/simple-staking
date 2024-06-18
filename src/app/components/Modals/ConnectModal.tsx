import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";

import { useTerms } from "@/app/context/Terms/TermsContext";
import { getNetworkConfig } from "@/config/network.config";
import { BROWSER_INJECTED_WALLET_NAME, walletList } from "@/utils/wallet/list";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

import { GeneralModal } from "./GeneralModal";

interface ConnectModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onConnect: (walletProvider: WalletProvider) => void;
  connectDisabled: boolean;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  open,
  onClose,
  onConnect,
  connectDisabled,
}) => {
  const [accepted, setAccepted] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const [injectedWalletProviderName, setInjectedWalletProviderName] =
    useState("Browser");
  const [injectedWalletProviderIcon, setInjectedWalletProviderIcon] =
    useState("");

  // This constant is used to identify the browser wallet
  // And whether or not it should be injected
  const BROWSER = "btcwallet";

  const { openTerms } = useTerms();

  useEffect(() => {
    const fetchWalletProviderDetails = async () => {
      // Check if the browser wallet is injectable
      if (window[BROWSER]) {
        // Get the name and icon of the injected wallet
        const name =
          window[BROWSER].getWalletProviderName &&
          (await window[BROWSER].getWalletProviderName());
        const icon =
          window[BROWSER].getWalletProviderIcon &&
          (await window[BROWSER].getWalletProviderIcon());
        // Set the name and icon of the injected wallet if they exist
        name && setInjectedWalletProviderName(`${name} (Browser)`);
        icon && setInjectedWalletProviderIcon(icon);
      }
    };

    setMounted(true);
    fetchWalletProviderDetails();
  }, []);

  if (!mounted) {
    return null;
  }

  const isInjectable = !!window[BROWSER];
  const { networkName } = getNetworkConfig();

  const handleConnect = async () => {
    if (selectedWallet) {
      let walletInstance: WalletProvider;

      if (selectedWallet === BROWSER) {
        if (!isInjectable) {
          throw new Error("Browser selected without an injectable interface");
        }
        // we are using the browser wallet
        walletInstance = window[BROWSER];
      } else {
        // we are using a custom wallet
        const walletProvider = walletList.find(
          (w) => w.name === selectedWallet,
        )?.wallet;
        if (!walletProvider) {
          throw new Error("Wallet provider not found");
        }
        walletInstance = new walletProvider();
      }

      onConnect(walletInstance);
    }
  };

  const buildInjectableWallet = (shouldDisplay: boolean, name: string) => {
    if (!shouldDisplay) {
      return null;
    }

    return (
      <button
        key={name}
        className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary ${selectedWallet === BROWSER ? "border-primary" : "border-base-100"}`}
        onClick={() => setSelectedWallet(BROWSER)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white p-2 text-black">
          {injectedWalletProviderIcon ? (
            <Image
              src={injectedWalletProviderIcon}
              alt={injectedWalletProviderName}
              width={26}
              height={26}
            />
          ) : (
            <FaWallet size={26} />
          )}
        </div>
        <p>{injectedWalletProviderName}</p>
      </button>
    );
  };

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Connect wallet</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2 rounded-xl bg-base-100 p-4">
            <input
              type="checkbox"
              className="checkbox-primary checkbox"
              onChange={(e) => setAccepted(e.target.checked)}
              checked={accepted}
            />
            <span className="label-text">
              I certify that I have read and accept the updated{" "}
              <button
                onClick={openTerms}
                className="transition-colors hover:text-primary cursor-pointer btn btn-link no-underline text-base-content px-0 h-auto min-h-0"
              >
                Terms of Use
              </button>
              .
            </span>
          </label>
        </div>
        <div className="my-4 flex flex-col gap-4">
          <h3 className="text-center font-semibold">Choose wallet</h3>
          <div className="grid max-h-[20rem] grid-cols-1 gap-4 overflow-y-auto">
            {walletList.map(
              ({
                provider,
                name,
                linkToDocs,
                icon,
                isQRWallet,
                supportedNetworks,
              }) => {
                if (name === BROWSER_INJECTED_WALLET_NAME) {
                  return buildInjectableWallet(isInjectable, name);
                }
                const walletAvailable = isQRWallet || !!window[provider as any];

                // If the wallet is integrated but does not support the current network, do not display it
                if (
                  !supportedNetworks ||
                  !supportedNetworks.includes(getNetworkConfig().network)
                ) {
                  return null;
                }

                return (
                  <a
                    key={name}
                    className={`relative flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary ${selectedWallet === name ? "border-primary" : "border-base-100"} ${!walletAvailable ? "opacity-50" : ""}`}
                    onClick={() => walletAvailable && setSelectedWallet(name)}
                    href={!walletAvailable ? linkToDocs : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white p-2">
                        <Image src={icon} alt={name} width={26} height={26} />
                      </div>
                      <p>{name}</p>
                      {isQRWallet && (
                        <div>
                          <span
                            className="cursor-pointer text-xs"
                            data-tooltip-id={name}
                            data-tooltip-content="QR codes used for connection/signing"
                            data-tooltip-place="top"
                          >
                            <AiOutlineInfoCircle />
                          </span>
                          <Tooltip id={name} />
                        </div>
                      )}
                    </div>
                  </a>
                );
              },
            )}
          </div>
        </div>
        <button
          className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-2 text-white"
          onClick={handleConnect}
          disabled={connectDisabled || !accepted || !selectedWallet}
        >
          <PiWalletBold size={20} />
          Connect to {networkName} network
        </button>
      </div>
    </GeneralModal>
  );
};
