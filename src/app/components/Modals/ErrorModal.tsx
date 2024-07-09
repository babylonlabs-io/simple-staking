import { format } from "date-fns";
import { IoMdClose } from "react-icons/io";

import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState, ShowErrorParams } from "@/app/types/errors";

import { GeneralModal } from "./GeneralModal";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  errorMessage: string;
  errorState?: ErrorState;
  errorTime: Date;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  onRetry,
  errorMessage,
  errorState,
  errorTime,
}) => {
  const { error, retryErrorAction } = useError();

  const handleRetry = () => {
    const retryErrorParam: ShowErrorParams = {
      error: {
        message: error.message,
        errorState: error.errorState,
        errorTime: new Date(),
      },
      retryAction: retryErrorAction,
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
        return `Your request to unbound failed due to: ${errorMessage}`;
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

  const formattedErrorTime = format(errorTime, "dd MMMM yyyy 'at' HH:mm:ss");

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      classNames={{ modal: "bg-es-bg" }}
    >
      <div className="mb- flex items-center justify-end">
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose()}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <h3 className="text-xl uppercase text-center font-semibold text-error">
          {getErrorTitle()}
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-medium text-sm text-es-text-hint">
            {getErrorMessage()}
          </p>
          <p className="text-center text-xs opacity-50">{formattedErrorTime}</p>
        </div>
        <div className="mt-4 flex justify-around gap-4">
          <button className="es-button-secondary" onClick={() => onClose()}>
            Cancel
          </button>
          <button className="es-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    </GeneralModal>
  );
};
