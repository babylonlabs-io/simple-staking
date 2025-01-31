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
import { ErrorType, ShowErrorParams } from "@/app/types/errors";
import { getCommitHash } from "@/utils/version";

export const ErrorModal: React.FC = () => {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;
  const { error, modalOptions, dismissError, isOpen } = useError();
  const { retryAction, noCancel } = modalOptions;
  const [copied, setCopied] = useState(false);
  const version = getCommitHash();

  const handleRetry = () => {
    const retryErrorParam: ShowErrorParams = {
      error: {
        message: error.message,
        type: error.type,
      },
      retryAction: retryAction,
    };

    dismissError();

    setTimeout(() => {
      if (retryErrorParam.retryAction) {
        retryErrorParam.retryAction();
      }
    }, 300);
  };

  const ERROR_TITLES = {
    [ErrorType.SERVER]: "Server Error",
    [ErrorType.WITHDRAW]: "Withdraw Error",
    [ErrorType.STAKING]: "Stake Error",
    [ErrorType.UNBONDING]: "Unbonding Error",
    [ErrorType.REGISTRATION]: "Transition Error",
    [ErrorType.DELEGATIONS]: "Delegations Error",
    [ErrorType.WALLET]: "Wallet Error",
    [ErrorType.UNKNOWN]: "Unknown Error",
  };

  const ERROR_MESSAGES = {
    [ErrorType.SERVER]: "Error fetching data due to:",
    [ErrorType.UNBONDING]: "Your request to unbond failed due to:",
    [ErrorType.WITHDRAW]: "Failed to withdraw due to:",
    [ErrorType.STAKING]: "Failed to stake due to:",
    [ErrorType.DELEGATIONS]: "Failed to fetch delegations due to:",
    [ErrorType.REGISTRATION]: "Failed to transition due to:",
    [ErrorType.WALLET]: "Failed to perform wallet action due to:",
    [ErrorType.UNKNOWN]: "An unknown error occurred:",
  };

  const getErrorTitle = () => {
    return ERROR_TITLES[error.type ?? ErrorType.UNKNOWN];
  };

  const getErrorMessage = () => {
    const prefix = ERROR_MESSAGES[error.type ?? ErrorType.UNKNOWN];
    return `${prefix} ${error.message}`;
  };

  const copyErrorDetails = () => {
    const errorDetails = JSON.stringify(
      {
        date: new Date().toISOString(),
        device: navigator.userAgent,
        message: error.message,
        type: error.type,
        version,
        eventId: error.sentryEventId,
        release: version,
        environment: process.env.NODE_ENV,
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
      open={isOpen}
      onClose={dismissError}
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
            onClick={dismissError}
          >
            Cancel
          </Button>
        )}
        {retryAction && (
          <Button className="px-2" fluid onClick={handleRetry}>
            Try Again
          </Button>
        )}
      </DialogFooter>
    </DialogComponent>
  );
};
