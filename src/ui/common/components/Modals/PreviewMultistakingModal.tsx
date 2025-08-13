import {
  Button,
  Card,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren } from "react";

import { BsnFpDisplayItem, StakingDetails } from "@/ui/common/types/display";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface PreviewMultistakingModalProps {
  open: boolean;
  processing?: boolean;
  onClose: () => void;
  onProceed: () => void;
  bsns: BsnFpDisplayItem[];
  finalityProviders: BsnFpDisplayItem[];
  details: StakingDetails;
  isExpansion?: boolean; // For expansion-specific behavior
}

export const PreviewMultistakingModal = ({
  open,
  processing = false,
  onClose,
  onProceed,
  bsns,
  finalityProviders,
  details,
  isExpansion = false,
}: PropsWithChildren<PreviewMultistakingModalProps>) => {
  const fields = [
    { label: "Stake Amount", value: details.stakeAmount },
    { label: "Fee Rate", value: details.feeRate },
    { label: "Transaction Fees", value: details.transactionFees },
    {
      label: "Term",
      value: (
        <>
          {details.term.blocks}
          <br />
          <span className="text-md text-secondary">
            {details.term.duration}
          </span>
        </>
      ),
    },
    { label: "Unbonding", value: details.unbonding },
    { label: "Unbonding Fee", value: details.unbondingFee },
  ];

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title="Preview"
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="flex flex-col mb-8 mt-4 text-accent-primary gap-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-12rem)]">
        <Card className="p-4 pt-2">
          <div className="flex flex-col">
            {bsns.length > 1 && (
              <div className="grid grid-cols-2 gap-4 items-center mb-2">
                <Text
                  variant="caption"
                  className="text-secondary text-left ml-4"
                >
                  BSNs
                </Text>
                <Text variant="caption" className="text-secondary text-left">
                  Finality Provider
                </Text>
              </div>
            )}
            <div className="bg-primary-contrast rounded p-4 max-h-48 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {bsns.map((bsnItem, index) => {
                  const fpItem = finalityProviders[index];
                  return (
                    <div
                      key={`pair-${index}`}
                      className="grid grid-cols-2 gap-4 items-center"
                    >
                      <div
                        className={`flex items-center justify-start gap-2 w-full py-1 ${
                          bsnItem.isExisting ? "opacity-50" : ""
                        }`}
                      >
                        {bsnItem.icon}
                        <Text variant="body2" className="font-medium">
                          {bsnItem.name}
                        </Text>
                      </div>
                      <div
                        className={`flex items-center justify-start gap-2 w-full py-1 ${
                          fpItem?.isExisting ? "opacity-50" : ""
                        }`}
                      >
                        {fpItem?.icon}
                        <Text variant="body2" className="font-medium">
                          {fpItem?.name}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-between py-1"
            >
              <Text variant="body2" className="text-secondary font-normal">
                {field.label}
              </Text>
              <Text variant="body2" className="text-right font-normal">
                {field.value}
              </Text>
            </div>
          ))}
        </div>

        <div className="border-t border-divider w-full" />

        <div className="pt-2 gap-2 flex flex-col">
          <Text variant="body1" className="text-secondary">
            Attention!
          </Text>
          <Text variant="body2" className="text-secondary">
            1. No third party possesses your staked BTC. You are the only one
            who can unbond and withdraw your stake.
          </Text>
          <Text variant="body2" className="text-secondary">
            2. Your stake will first be sent to Babylon Genesis for verification
            (~20 seconds), then you will be prompted to submit it to the Bitcoin
            ledger. It will be marked as &apos;Pending&apos; until it receives
            10 Bitcoin confirmations.
          </Text>
          {/* Additional expansion related text */}
          {isExpansion && (
            <Text variant="body2" className="text-secondary">
              3. Please note: submitting this transaction will reset your
              stake&apos;s timelock.
            </Text>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4 pb-8 pt-0">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onProceed}
          className="flex-1"
          disabled={processing}
        >
          {processing ? "Processing..." : "Proceed to Signing"}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
