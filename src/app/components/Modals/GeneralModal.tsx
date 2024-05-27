import { useRef, ReactNode, useEffect } from "react";
import { Modal } from "react-responsive-modal";

interface GeneralModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  children: ReactNode;
}

export const GeneralModal: React.FC<GeneralModalProps> = ({
  open,
  onClose,
  children,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [open]);

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        modalContainer: "flex items-end justify-center md:items-center",
        modal:
          "m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:max-w-[45rem] md:rounded-b-2xl lg:max-w-[55rem] max-h-[85svh]",
      }}
      showCloseIcon={false}
      blockScroll={false}
    >
      {children}
    </Modal>
  );
};
