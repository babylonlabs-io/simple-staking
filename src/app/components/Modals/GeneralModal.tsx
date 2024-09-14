import { ReactNode, useEffect, useRef } from "react";
import { Modal } from "react-responsive-modal";
import { twMerge } from "tailwind-merge";

interface GeneralModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  small?: boolean;
  children: ReactNode;
  className?: string;
  disableModalClose?: boolean;
  closeOnEsc?: boolean;
}

export const GeneralModal: React.FC<GeneralModalProps> = ({
  open,
  onClose,
  children,
  small,
  className = "",
  disableModalClose,
  closeOnEsc = true,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        modalContainer: "flex items-end justify-center md:items-center",
        modal: twMerge(
          `m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:rounded-b-2xl max-h-[100svh] min-w-[20rem] md:max-h-[85svh] md:min-w-[30rem]`,
          small ? "md:max-w-[25rem]" : "md:max-w-[45rem] lg:max-w-[55rem]",
          className,
        ),
      }}
      showCloseIcon={false}
      blockScroll={false}
      closeOnEsc={closeOnEsc}
      closeOnOverlayClick={!disableModalClose}
    >
      {children}
    </Modal>
  );
};
