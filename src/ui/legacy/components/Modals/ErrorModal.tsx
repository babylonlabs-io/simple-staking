import {
  Button,
  DialogBody,
  DialogFooter,
  Heading,
  Text,
} from "@babylonlabs-io/core-ui";
import { useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

import WarningTriangle from "@/ui/legacy/assets/warning-triangle.svg";
import { useError } from "@/ui/legacy/context/Error/ErrorProvider";
import { ErrorType, ShowErrorParams } from "@/ui/legacy/types/errors";
import { getCommitHash } from "@/ui/legacy/utils/version";

import { ResponsiveDialog } from "./ResponsiveDialog";

export const ErrorModal: React.FC = () => {
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
    [ErrorType.UNKNOWN]: "System Error",
  };

  const ERROR_MESSAGES = {
    [ErrorType.SERVER]: "Error fetching data due to:",
    [ErrorType.UNBONDING]: "Your request to unbond failed due to:",
    [ErrorType.WITHDRAW]: "Failed to withdraw due to:",
    [ErrorType.STAKING]: "Failed to stake due to:",
    [ErrorType.DELEGATIONS]: "Failed to fetch delegations due to:",
    [ErrorType.REGISTRATION]: "Failed to transition due to:",
    [ErrorType.WALLET]: "Failed to perform wallet action due to:",
    [ErrorType.UNKNOWN]: "A system error occurred:",
  };

  const getErrorTitle = () => {
    return ERROR_TITLES[error.type ?? ErrorType.UNKNOWN];
  };

  const getErrorMessage = () => {
    const prefix = ERROR_MESSAGES[error.type ?? ErrorType.UNKNOWN];
    return `${prefix} ${error.displayMessage || error.message}`;
  };

  const copyErrorDetails = () => {
    const errorDetails = JSON.stringify(
      {
        date: new Date().toISOString(),
        device: navigator.userAgent,
        version,
        release: version,
        environment: process.env.NODE_ENV,
        ...error,
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
    <ResponsiveDialog
      className="z-[150]"
      backdropClassName="z-[100]"
      open={isOpen}
      onClose={dismissError}
    >
      <DialogBody className="text-accent-primary py-16 text-center">
        <div className="inline-flex bg-primary-contrast h-20 w-20 items-center justify-center mb-6">
          <img src={WarningTriangle} alt="Warning" width={48} height={42} />
        </div>

        <Heading variant="h4" className="mb-4 text-accent-primary">
          {getErrorTitle()}
        </Heading>

        <div className="flex flex-col gap-3">
          <Text variant="body1" className="text-center text-accent-secondary">
            {getErrorMessage()}
          </Text>

          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              className="flex items-center gap-1 text-sm text-accent-secondary hover:opacity-70"
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

      <DialogFooter className="flex gap-4">
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
    </ResponsiveDialog>
  );
};
