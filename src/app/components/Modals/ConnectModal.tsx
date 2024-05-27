import { useEffect, useRef, useState } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";
import { PiWalletBold } from "react-icons/pi";
import Image from "next/image";
import { FaWallet } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { BROWSER_INJECTED_WALLET_NAME, walletList } from "@/utils/wallet/list";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

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
  const modalRef = useRef(null);
  const [accepted, setAccepted] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // This constant is used to identify the browser wallet
  // And whether or not it should be injected
  const BROWSER = "btcwallet";
  const isInjectable = !!window[BROWSER];

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

  const buildInjectableWallet = (shouldDisplay: boolean) => {
    if (!shouldDisplay) {
      return null;
    }

    return (
      <button
        className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary ${selectedWallet === BROWSER ? "border-primary" : "border-base-100"}`}
        onClick={() => setSelectedWallet(BROWSER)}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white p-2 text-black">
          <FaWallet size={26} />
        </div>
        <p>Browser</p>
      </button>
    );
  }

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        modalContainer: "flex items-end justify-center md:items-center",
        modal:
          "m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:max-w-[45rem] md:rounded-b-2xl lg:max-w-[55rem]",
      }}
      showCloseIcon={false}
    >
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
              <a
                href="/babylonchain_terms_of_use.doc"
                target="_blank"
                rel="noopener noreferrer"
                className="sublink text-primary hover:underline"
              >
                Terms of Use
              </a>
              .
            </span>
          </label>
        </div>
        <div className="my-4 flex flex-col gap-4">
          <h3 className="text-center font-semibold">Choose wallet</h3>
          <div className="grid max-h-[20rem] grid-cols-1 gap-4 overflow-y-auto">
            {walletList.map(
              ({ provider, name, linkToDocs, icon, isQRWallet }) => {
                if (name === BROWSER_INJECTED_WALLET_NAME) {
                  return buildInjectableWallet(isInjectable);
                }
                const walletAvailable = isQRWallet || !!window[provider as any];
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
          Connect to BTC signet network
        </button>
      </div>
    </Modal>
  );
};
