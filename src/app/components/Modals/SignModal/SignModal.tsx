import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  Text,
} from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useComposedSignOptionsData } from "@/app/hooks/useComposedSignOptions";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";

import { Step } from "./Step";

interface SignModalProps {
  processing?: boolean;
  open: boolean;
  title: string;
  step: number;
  onClose?: () => void;
  onSubmit?: () => void;
}

const { coinSymbol } = getNetworkConfigBTC();
const { coinSymbol: bbnCoinSymbol } = getNetworkConfigBBN();

export const SignModal = ({
  processing = false,
  open,
  title,
  step,
  onClose,
  onSubmit,
}: SignModalProps) => {
  const { getSignPsbtOptions } = useComposedSignOptionsData();
  const { bech32Address } = useCosmosWallet();

  // Generate step details based on transaction data
  const getStepDetails = useMemo(() => {
    // Helper to format or provide default for undefined values
    const formatValue = (value: any, formatter?: (v: any) => string) => {
      if (value === undefined || value === null) return "-";
      return formatter ? formatter(value) : value.toString();
    };

    // Format number with commas
    const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

    // Format BTC amount properly
    const formatBtcAmount = (sats: number) =>
      `${satoshiToBtc(sats)} ${coinSymbol}`;

    // Format public key (truncate)
    const formatPK = (pk: string) =>
      pk.length > 16
        ? `${pk.substring(0, 8)}...${pk.substring(pk.length - 8)}`
        : pk;

    // Format block count as time
    const formatBlocks = (blocks: number) => `${formatNumber(blocks)} blocks`;

    const data = getSignPsbtOptions();

    const signPsbtOptions =
      data.contracts && data.contracts.length > 0 && data.contracts[0].params
        ? data.contracts[0].params
        : {};

    return {
      // Step 1: Consent to slashing
      getStep1Details: () => ({
        "Finality Provider": formatValue(
          signPsbtOptions.finalityProviderPK,
          formatPK,
        ),
        "Staking Amount": formatValue(
          signPsbtOptions.stakingAmount,
          formatBtcAmount,
        ),
        "Staking Timelock": formatValue(
          signPsbtOptions.stakingTimelock,
          formatBlocks,
        ),
      }),

      // Step 2: Consent to slashing during unbonding
      getStep2Details: () => {
        const details: Record<string, string> = {
          "Unbonding Timelock": formatValue(
            signPsbtOptions.unbondingTimelock,
            formatBlocks,
          ),
          "Covenant Quorum": formatValue(
            signPsbtOptions.covenantQuorum,
            formatNumber,
          ),
        };

        // Add individual covenant public keys as array
        if (Array.isArray(signPsbtOptions.covenantPks)) {
          details["Covenant PKs Count"] = formatValue(
            signPsbtOptions.covenantPks,
            (count) => `${formatNumber(count)} keys`,
          );

          // Add each covenant public key with its index
          signPsbtOptions.covenantPks.forEach((pk, index) => {
            details[`Covenant PK ${index + 1}`] = formatValue(pk, formatPK);
          });
        }

        return details;
      },

      // Step 3: Address binding
      getStep3Details: () => ({
        "BABY Address": formatValue(bech32Address),
      }),

      // Step 4: Transaction registration
      getStep4Details: () => ({}),
    };
  }, [getSignPsbtOptions, bech32Address]);

  const step1Details = useMemo(
    () => getStepDetails.getStep1Details(),
    [getStepDetails],
  );
  const step2Details = useMemo(
    () => getStepDetails.getStep2Details(),
    [getStepDetails],
  );
  const step3Details = useMemo(
    () => getStepDetails.getStep3Details(),
    [getStepDetails],
  );
  const step4Details = useMemo(
    () => getStepDetails.getStep4Details(),
    [getStepDetails],
  );

  return (
    <ResponsiveDialog open={open} onClose={onClose} hasBackdrop>
      <DialogHeader
        title={title}
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4">
        <Text variant="body1" className="text-accent-secondary">
          Please sign the following messages
        </Text>

        <div className="py-4 flex flex-col items-start gap-6">
          <Step step={1} currentStep={step} details={step1Details}>
            Consent to slashing
          </Step>
          <Step step={2} currentStep={step} details={step2Details}>
            Consent to slashing during unbonding
          </Step>
          <Step step={3} currentStep={step} details={step3Details}>
            {coinSymbol}-{bbnCoinSymbol} address binding for receiving staking
            rewards
          </Step>
          <Step step={4} currentStep={step} details={step4Details}>
            Staking transaction registration
          </Step>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        {onClose && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onClose}
            className="flex-1 text-xs sm:text-base"
          >
            Cancel
          </Button>
        )}

        {onSubmit && (
          <Button
            disabled={processing}
            variant="contained"
            className="flex-1 text-xs sm:text-base"
            onClick={onSubmit}
          >
            {processing ? (
              <Loader size={16} className="text-accent-contrast" />
            ) : (
              "Sign"
            )}
          </Button>
        )}
      </DialogFooter>
    </ResponsiveDialog>
  );
};
