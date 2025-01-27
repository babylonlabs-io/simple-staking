import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Heading,
  MobileDialog,
  Text,
} from "@babylonlabs-io/bbn-core-ui";
import { useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { MdOutlineSwapHoriz } from "react-icons/md";

import { useError } from "@/app/context/Error/ErrorProvider";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { ErrorState, ShowErrorParams } from "@/app/types/errors";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  errorMessage: string;
  errorState?: ErrorState;
  noCancel?: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  onRetry,
  errorMessage,
  errorState,
  noCancel,
}) => {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;
  const { error, modalOptions } = useError();
  const { retryAction, noCancel: noCancelOption } = modalOptions;
  const [copied, setCopied] = useState(false);
  const version = process.env.NEXT_PUBLIC_COMMIT_HASH ?? "development";

  const handleRetry = () => {
    const retryErrorParam: ShowErrorParams = {
      error: {
        message: error.message,
        errorState: error.errorState,
      },
      retryAction: retryAction,
    };

    onClose();

    setTimeout(() => {
      if (retryErrorParam.retryAction) {
        retryErrorParam.retryAction();
      }
    }, 300);
  };

  const getErrorTitle = () => {
    switch (errorState) {
      case ErrorState.SERVER_ERROR:
        return "Server Error";
      case ErrorState.WALLET:
        return "Network Error";
      case ErrorState.WITHDRAW:
        return "Withdraw Error";
      case ErrorState.STAKING:
        return "Stake Error";
      case ErrorState.UNBONDING:
        return "Unbonding Error";
      default:
        return "Unknown Error";
    }
  };

  const getErrorMessage = () => {
    switch (errorState) {
      case ErrorState.SERVER_ERROR:
        return `Error fetching data due to: ${errorMessage}`;
      case ErrorState.UNBONDING:
        return `Your request to unbond failed due to: ${errorMessage}`;
      case ErrorState.WITHDRAW:
        return `Failed to withdraw due to: ${errorMessage}`;
      case ErrorState.STAKING:
        return `Failed to stake due to: ${errorMessage}`;
      case ErrorState.WALLET:
        return `Failed to switch network due to: ${errorMessage}`;
      default:
        return errorMessage;
    }
  };

  const copyErrorDetails = () => {
    const errorDetails = JSON.stringify(
      {
        message: errorMessage,
        errorState,
        version,
        sentry: {
          // eventId: error?.sentryEventId,
          release: version,
          environment: process.env.NODE_ENV,
        },
      },
      null,
      2,
    );

    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <DialogComponent
      backdropClassName="z-[100]"
      className="z-[150]"
      open={open}
      onClose={onClose}
    >
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4 items-center justify-center">
        <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
          <MdOutlineSwapHoriz className="text-5xl text-primary-light" />
        </div>
        <Heading variant="h3" className="text-center font-bold text-error-main">
          {getErrorTitle()}
        </Heading>
        <div className="flex flex-col gap-3">
          <Text variant="body1" className="text-center">
            {getErrorMessage()}
          </Text>
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              className="flex items-center gap-1 text-sm text-primary-dark hover:opacity-70"
              onClick={copyErrorDetails}
            >
              {copied ? (
                <FiCheck className="w-4 h-4" />
              ) : (
                <FiCopy className="w-4 h-4" />
              )}
              <span>{copied ? "Copied!" : "Copy error details"}</span>
            </button>
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="mt-4 flex justify-around gap-4">
        {!noCancel && ( // Only show the cancel button if noCancel is false or undefined
          <Button
            variant="outlined"
            fluid
            className="px-2"
            onClick={() => onClose()}
          >
            Cancel
          </Button>
        )}
        {onRetry && (
          <Button className="px-2" onClick={handleRetry}>
            Try Again
          </Button>
        )}
      </DialogFooter>
    </DialogComponent>
  );
};
