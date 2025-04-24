import { DialogBody, DialogFooter } from "@babylonlabs-io/core-ui";
import { useEffect, useState } from "react";

import { useError } from "@/app/context/Error/ErrorProvider";
import { ErrorType, ShowErrorParams } from "@/app/types/errors";
import { Box, Button, Icon } from "@/ui";
import { getCommitHash } from "@/utils/version";

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
      className="z-[150] flounder:w-[440px]"
      backdropClassName="z-[100]"
      open={isOpen}
      onClose={dismissError}
    >
      <DialogBody className="text-accent-primary py-6 mb-4 text-center">
        <Box flex alignItems="center" justifyContent="center" className="mb-2">
          <Icon
            iconKey="warning"
            className="text-backgroundErrorOnDefault"
            size={20}
          />
        </Box>

        <h4 className="mb-2 font-sans font-bold text-h5"> {getErrorTitle()}</h4>

        <div className="flex flex-col gap-3">
          <p className="font-medium text-callout text-itemSecondaryDefault text-pretty">
            {getErrorMessage()}
          </p>

          <div className="flex items-center justify-center gap-4 mt-2">
            <Button
              variant="primary"
              color="transparent"
              size="sm"
              className="flex items-center gap-1 hover:opacity-70 normal-case no-underline"
              startIcon={{ iconKey: copied ? "check" : "copy", size: 14 }}
              onClick={copyErrorDetails}
            >
              <span>{copied ? "Copied!" : "Copy error details"}</span>
            </Button>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-4">
        {!noCancel && ( // Only show the cancel button if noCancel is false or undefined
          <Button
            variant="outline"
            className="px-2 w-full"
            onClick={dismissError}
          >
            Cancel
          </Button>
        )}
        {retryAction && (
          <Button className="px-2 w-full" onClick={handleRetry}>
            Try Again
          </Button>
        )}
      </DialogFooter>
    </ResponsiveDialog>
  );
};
