import { ReactNode, useEffect, useRef } from "react";
import { Modal } from "react-responsive-modal";

interface GeneralModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  small?: boolean;
  children: ReactNode;
  position?: "center" | "right";
  classNames?: {
    modalContainer?: string;
    modal?: string;
  };
}

export const GeneralModal: React.FC<GeneralModalProps> = ({
  open,
  onClose,
  children,
  small,
  position = "center",
  classNames = {},
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

  const getSize = () => {
    if (small) {
      return "md:max-w-[25rem]";
    } else {
      return "md:max-w-[45rem] lg:max-w-[55rem]";
    }
  };

  const getPositionClasses = () => {
    if (position === "right") {
      return "absolute top-1/2 right-0 transform -translate-y-1/2";
    } else {
      return "flex items-end justify-center md:items-center";
    }
  };

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        modalContainer: `${getPositionClasses()} ${classNames.modalContainer || ""}`,
        modal: `m-0 w-full max-w-none  bg-es-bg shadow-lg md:w-auto  max-h-[85svh] min-w-[20rem] md:min-w-[30rem] ${getSize()} ${classNames.modal || ""}`,
      }}
      showCloseIcon={false}
      blockScroll={false}
    >
      {children}
    </Modal>
  );
};
