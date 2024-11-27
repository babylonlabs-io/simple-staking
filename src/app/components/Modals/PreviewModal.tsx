import {
  Avatar,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Heading,
  Loader,
  MobileDialog,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { useParams } from "@/app/hooks/api/useParams";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: () => void;
  finalityProvider: string | undefined;
  finalityProviderAvatar: string | undefined;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
  stakingFeeSat: number;
  feeRate: number;
  unbondingFeeSat: number;
  awaitingWalletResponse: boolean;
}

export const PreviewModal = ({
  isOpen,
  onClose,
  finalityProvider,
  finalityProviderAvatar,
  stakingAmountSat,
  stakingTimeBlocks,
  onSign,
  stakingFeeSat,
  feeRate,
  unbondingFeeSat,
  awaitingWalletResponse,
}: PreviewModalProps) => {
  const isMobileView = useIsMobileView();
  const { coinName } = getNetworkConfig();

  const { data: params } = useParams();
  const confirmationDepth =
    params?.btcEpochCheckParams?.latestParam?.btcConfirmationDepth || 10;

  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  const FinalityProviderValue = isMobileView ? (
    <span className="flex gap-2">
      {finalityProviderAvatar && (
        <Avatar
          size="small"
          url={finalityProviderAvatar}
          variant="circular"
          alt={finalityProvider || "-"}
        />
      )}
      <Text variant="body1">{finalityProvider || "-"}</Text>
    </span>
  ) : (
    <Text variant="body1">{finalityProvider || "-"}</Text>
  );

  const previewFields = [
    {
      key: "Finality Provider",
      value: FinalityProviderValue,
    },
    {
      key: "Stake Amount",
      value: (
        <Text variant="body1">
          {maxDecimals(satoshiToBtc(stakingAmountSat), 8)} {coinName}
        </Text>
      ),
    },
    {
      key: "Fee rate",
      value: <Text variant="body1">{feeRate} sat/vB</Text>,
    },
    {
      key: "Transaction fee",
      value: (
        <Text variant="body1">
          {maxDecimals(satoshiToBtc(stakingFeeSat), 8)} {coinName}
        </Text>
      ),
    },
    {
      key: "Term",
      value: (
        <Text variant="body1">{blocksToDisplayTime(stakingTimeBlocks)}</Text>
      ),
    },
    {
      key: "On Demand Unbonding",
      value: <Text variant="body1">Enabled (7 days unbonding time)</Text>,
    },
    {
      key: "Unbonding fee",
      value: (
        <Text variant="body1">
          {maxDecimals(satoshiToBtc(unbondingFeeSat), 8)} {coinName}
        </Text>
      ),
    },
  ];

  return (
    <DialogComponent open={isOpen} onClose={onClose}>
      <DialogHeader
        title="Preview"
        onClose={onClose}
        className="text-primary-dark"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="flex flex-col">
          {previewFields.map((field, index) => (
            <>
              <div key={field.key} className="flex justify-between">
                <Text variant="body1">{field.key}</Text>
                <div className="text-right">{field.value}</div>
              </div>
              {index < previewFields.length - 1 && (
                <div className="divider mx-0 my-2" />
              )}
            </>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Heading variant="h6">Attention!</Heading>
          <Text variant="body2">
            1. No third party possesses your staked {coinName}. You are the only
            one who can unbond and withdraw your stake.
          </Text>
          <Text variant="body2">
            2. Your stake will initially have the status of &quot;Pending&quot;
            until it receives {confirmationDepth} Bitcoin confirmations.
            &quot;Pending&quot; stake is only accessible through the device it
            was created.
          </Text>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1 text-xs sm:text-base"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSign}
          className="flex-1 text-xs sm:text-base"
          disabled={awaitingWalletResponse}
        >
          {awaitingWalletResponse ? (
            <Loader size={16} className="text-white" />
          ) : (
            "Proceed to Signing"
          )}
        </Button>
      </DialogFooter>
    </DialogComponent>
  );
};
