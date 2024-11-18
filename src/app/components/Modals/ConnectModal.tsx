import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { PiWalletBold } from "react-icons/pi";
import { Tooltip } from "react-tooltip";
import { twJoin } from "tailwind-merge";

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [noInscription, setNoInscription] = useState(false);
  const [noHWWallet, setNoHWWallet] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const [injectedWalletProviderName, setInjectedWalletProviderName] =
    useState("Browser");
  const [injectedWalletProviderIcon, setInjectedWalletProviderIcon] =
    useState("");

  // This constant is used to identify the browser wallet
  // And whether or not it should be injected
  const BROWSER = "btcwallet";

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

      // Clean up the state
      setTermsAccepted(false);
      setNoInscription(false);
      setNoHWWallet(false);
      setSelectedWallet("");

      // Connect to the wallet and close the modal
      onConnect(walletInstance);
    }
  };

  const buildInjectableWallet = (shouldDisplay: boolean, name: string) => {
    // NOTE: The 'OneKey (Browser)' special case here is a temporary solution
    // while waiting for the OneKey wallet to release their fixes
    if (!shouldDisplay || injectedWalletProviderName === "OneKey (Browser)") {
      return null;
    }

    return (
      <button
        key={name}
        className={twJoin(
          "flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary",
          selectedWallet === BROWSER ? "border-primary" : "border-base-100",
        )}
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
    <GeneralModal className="flex" open={open} onClose={onClose}>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Connect wallet</h3>
          <button
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => onClose(false)}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="flex flex-col justify-center gap-2">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2 rounded-xl bg-base-100 p-3 md:p-4">
                <input
                  type="checkbox"
                  className="checkbox-primary checkbox"
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  checked={termsAccepted}
                />
                <span className="label-text text-xs leading-snug md:text-sm">
                  I certify that I have read and accept the updated{" "}
                  <a
                    href="https://babylonlabs.io/terms-of-use"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    Terms of Use
                  </a>
                  {" and "}
                  <a
                    href="https://babylonlabs.io/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2 rounded-xl bg-base-100 p-3 md:p-4">
                <input
                  type="checkbox"
                  className="checkbox-primary checkbox"
                  onChange={(e) => setNoInscription(e.target.checked)}
                  checked={noInscription}
                />
                <span className="label-text text-xs leading-snug md:text-sm md:max-w-[34rem]">
                  I certify that I wish to stake bitcoin and agree that doing so
                  may cause some or all of the bitcoin ordinals, NFTs, runes,
                  and other inscriptions in the connected bitcoin wallet to be
                  lost. I acknowledge that this interface will not detect all
                  such inscriptions.
                </span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2 rounded-xl bg-base-100 p-3 md:p-4">
                <input
                  type="checkbox"
                  className="checkbox-primary checkbox"
                  onChange={(e) => setNoHWWallet(e.target.checked)}
                  checked={noHWWallet}
                />
                <span className="label-text text-xs leading-snug md:text-sm md:max-w-[34rem]">
                  I acknowledge that Keystone via QR code is the only hardware
                  wallet supporting Bitcoin Staking. Using any other hardware
                  wallets through any means (such as connection to software /
                  extension / mobile wallet) can lead to permanent inability to
                  withdraw the stake.
                </span>
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <h3 className="text-center font-semibold">Choose wallet</h3>
              <div className="grid md:max-h-[20rem] grid-cols-1 gap-4 md:overflow-y-auto">
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
                    const walletAvailable =
                      isQRWallet || !!window[provider as any];

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
                        className={twJoin(
                          "relative flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary",
                          selectedWallet === name
                            ? "border-primary"
                            : "border-base-100",
                          !walletAvailable ? "opacity-50" : "",
                        )}
                        onClick={() =>
                          walletAvailable && setSelectedWallet(name)
                        }
                        href={!walletAvailable ? linkToDocs : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="flex flex-1 items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white p-2">
                            <Image
                              src={icon}
                              alt={name}
                              width={26}
                              height={26}
                            />
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
                              <Tooltip id={name} className="tooltip-wrap" />
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-primary mt-4 btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-2 text-white"
          onClick={handleConnect}
          disabled={
            connectDisabled ||
            !termsAccepted ||
            !selectedWallet ||
            !noInscription ||
            !noHWWallet
          }
        >
          <PiWalletBold size={20} />
          Connect to {networkName} network
        </button>
      </div>
    </GeneralModal>
  );
};
