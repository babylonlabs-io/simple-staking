import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren, useState } from "react";
import { MdCelebration } from "react-icons/md";

import { shouldDisplayTestingMsg } from "@/config";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface Phase2HereModalProps {
  className?: string;
}

const { networkName, coinSymbol: btcCoinSymbol } = getNetworkConfigBTC();
const { networkFullName: bbnNetworkFullName, coinSymbol: bbnCoinSymbol } =
  getNetworkConfigBBN();

export const Phase2HereModal = ({
  className,
}: PropsWithChildren<Phase2HereModalProps>) => {
  const [showPhase2HereModal, setShowPhase2HereModal] = useState(true);

  return (
    <ResponsiveDialog
      className={className}
      open={showPhase2HereModal}
      onClose={() => setShowPhase2HereModal(false)}
    >
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4 text-center items-center justify-center">
        <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
          <MdCelebration className="text-5xl text-primary-light" />
        </div>
        <Heading variant="h4">{bbnNetworkFullName} is here!</Heading>
        <p className="text-base">
          The {bbnNetworkFullName} blockchain has launched, signalling the start
          of the new phase of Babylon {btcCoinSymbol} Staking protocol.{" "}
          {networkName} stakers can now register on the {bbnNetworkFullName}{" "}
          blockchain to enhance security and earn {bbnCoinSymbol}.{" "}
          <a href="https://babylon.foundation/blogs/babylon-phase-2-launch-official-announcement">
            Learn more here.
          </a>
        </p>
        {shouldDisplayTestingMsg() && (
          <p className="text-base">
            <br />
            Note: This testnet is not incentivized.
          </p>
        )}
      </DialogBody>

      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          onClick={() => setShowPhase2HereModal(false)}
          className="flex-1"
        >
          OK
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
