import { useRef } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";
import { useTheme } from "@/app/hooks/useTheme";
import { format } from "date-fns";
import { ErrorMetadata, ErrorState } from "@/app/types/errorState";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  errorCode?: string;
  errorMessage: string;
  errorState?: ErrorState;
  errorTime: Date;
  metadata?: ErrorMetadata;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  onRetry,
  errorCode,
  errorMessage,
  errorState,
  errorTime,
  metadata,
}) => {
  const modalRef = useRef(null);
  const { lightSelected } = useTheme();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onClose();
  };

  const getErrorTitle = () => {
    switch (errorState) {
      case ErrorState.POST_UNBOUNDING:
        return "Unbounding Error";
      case ErrorState.GET_STAKING:
        return "Staking Error";
      case ErrorState.GET_DELEGATION:
        return "Delegation Error";
      case ErrorState.GET_FINALITY_PROVIDER:
        return "Finality Provider Error";
      case ErrorState.GET_STATS:
        return "Stats Error";
      case ErrorState.GET_GLOBAL_PARAMS:
        return "Global Params Error";
      case ErrorState.GET_UNBOUNDING_ELIGIBILITY:
        return "Unbounding Eligiblity Error";
      case ErrorState.SWITCH_NETWORK:
        return "Network Error";
      default:
        return "Unknown Error";
    }
  };

  const getErrorMessage = () => {
    switch (errorState) {
      case ErrorState.POST_UNBOUNDING:
        return `Your request to unbound ${btcAmount} BTC failed due to: ${errorMessage}`;
      case ErrorState.GET_STAKING:
        return `Failed to fetch staking data due to: ${errorMessage}`;
        case ErrorState.GET_DELEGATION:
        return `Failed to fetch delegation data due to: ${errorMessage}`; 
      case ErrorState.GET_FINALITY_PROVIDER:
        return `Failed to fetch finality provider data due to: ${errorMessage}`
      case ErrorState.GET_STATS:
        return `Failed to fetch stats due to: ${errorMessage}`
      case ErrorState.GET_GLOBAL_PARAMS:
        return `Failed to fetch global params due to: ${errorMessage}`
      case ErrorState.GET_UNBOUNDING_ELIGIBILITY:
        return `Failed to fetch unbounding eligiblity due to: ${errorMessage}`
      case ErrorState.SWITCH_NETWORK:
        return `Failed to switch network due to: ${errorMessage}`
      default:
        return errorMessage;
    }
  };

  const formattedErrorTime = format(errorTime, "dd MMMM yyyy 'at' HH:mm:ss");

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose()}
      classNames={{
        root: `${lightSelected ? "light" : "dark"}`,
        modalContainer: "flex items-end justify-center md:items-center",
        modal:
          "m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:max-w-[45rem] md:rounded-b-2xl lg:max-w-[55rem]",
      }}
      showCloseIcon={false}
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
        <h3 className="font-bold text-center text-error">{getErrorTitle()}</h3>
        <div className="flex flex-col gap-3">
          <p className="text-center">{getErrorMessage()}</p>
          <p className="text-center text-xs opacity-50">{formattedErrorTime}</p>
        </div>
        <div className="flex justify-around gap-4 mt-4">
          <button
            className="btn-outline flex-1 btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-2 text-white"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          {onRetry && (
            <button
              className="btn-primary flex-1 btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-2 text-white"
              onClick={handleRetry}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};