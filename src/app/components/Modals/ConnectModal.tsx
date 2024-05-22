import { useRef, useState } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";
import { PiWalletBold } from "react-icons/pi";
import Image from "next/image";

import { walletList } from "@/utils/wallet/list";
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

  const handleConnect = async () => {
    if (selectedWallet) {
      const walletProvider = walletList.find(
        (w) => w.name === selectedWallet,
      )?.wallet;
      if (!walletProvider) {
        throw new Error("Wallet provider not found");
      }
      const walletInstance = new walletProvider();
      onConnect(walletInstance);
    }
  };

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
          <div className="grid grid-cols-2 gap-4">
            {walletList.map((wallet) => (
              <div
                key={wallet.name}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-base-100 p-2 transition-all hover:text-primary ${selectedWallet === wallet.name ? "border-primary" : "border-base-100"}`}
                onClick={() => setSelectedWallet(wallet.name)}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-white p-2">
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={32}
                    height={32}
                  />
                </div>
                <p>{wallet.name}</p>
              </div>
            ))}
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
