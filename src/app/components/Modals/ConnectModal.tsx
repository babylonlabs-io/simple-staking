import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import ArrowRight from "@/app/components/Icons/ArrowRight";
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
  const [, setSelectedWallet] = useState<string>("");
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

  const handleConnect = async (name: string) => {
    if (name) {
      let walletInstance: WalletProvider;

      if (name === BROWSER) {
        if (!isInjectable) {
          throw new Error("Browser selected without an injectable interface");
        }
        // we are using the browser wallet
        walletInstance = window[BROWSER];
      } else {
        // we are using a custom wallet
        const walletProvider = walletList.find((w) => w.name === name)?.wallet;
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
        className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary border-base-100`}
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
    <GeneralModal
      open={open}
      onClose={onClose}
      classNames={{
        modal:
          "h-screen flex flex-col max-h-screen mr-2 lg:w-[480px] lg-max-w-[480px] my-0",
      }}
      position="right"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          className="btn-sm ml-auto flex items-center gap-2 transition-opacity hover:opacity-70"
          onClick={() => onClose(false)}
        >
          <span className="uppercase text-base leading-none mt-0.5">Close</span>
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col  gap-4 flex-grow">
        <div className="my-4 flex flex-col gap-4">
          <h3 className="text-center font-semibold text-2xl">
            SELECT YOUR WALLET TO CONTINUE
          </h3>
          <div className="grid max-h-[40rem] grid-cols-1 gap-4 overflow-y-auto">
            {walletList.map(
              ({ provider, name, linkToDocs, icon, isQRWallet }) => {
                if (name === BROWSER_INJECTED_WALLET_NAME) {
                  return buildInjectableWallet(isInjectable, name);
                }
                const walletAvailable = isQRWallet || !!window[provider as any];
                return (
                  <a
                    key={name}
                    className={`relative flex cursor-pointer items-center gap-2 px-8 border bg-es-secondary-2 p-2 transition-all  hover:text-es-accent hover:border-es-accent wallet-link border-base-100 ${!walletAvailable ? "opacity-50" : ""}`}
                    onClick={() => walletAvailable && handleConnect(name)}
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
                      <div className="ml-auto flex items-center gap-2 uppercase">
                        <p
                          className={`${walletAvailable ? "text-[#bbff9b] wallet-detected-link" : ""}`}
                        >
                          {walletAvailable ? "detected" : "install"}
                        </p>
                        <ArrowRight />
                      </div>
                    </div>
                  </a>
                );
              },
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-auto pt-6 border-t border-es-secondary-2">
          <div>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id="termsOfUse"
              data-tooltip-content="Terms tooltip"
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip id="termsOfUse" />
          </div>
          <span className="label-text text-es-text-secondary text-base">
            By connecting your wallet, you agree to our Terms of Use and{" "}
            <a
              href="/babylonchain_terms_of_use.doc"
              target="_blank"
              rel="noopener noreferrer"
              className="sublink text-es-text underline"
            >
              Terms of Use{" "}
            </a>
            and
            <a
              href="/babylonchain_terms_of_use.doc"
              target="_blank"
              rel="noopener noreferrer"
              className="sublink text-es-text underline"
            >
              {" "}
              Privacy Policy
            </a>
          </span>
        </div>
      </div>
    </GeneralModal>
  );
};
