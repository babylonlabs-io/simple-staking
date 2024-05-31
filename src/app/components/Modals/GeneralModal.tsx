import { ReactNode, useEffect, useRef } from "react";
import { Modal } from "react-responsive-modal";

interface GeneralModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  small?: boolean;
  children: ReactNode;
}

export const GeneralModal: React.FC<GeneralModalProps> = ({
  open,
  onClose,
  children,
  small,
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

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        modalContainer: "flex items-end justify-center md:items-center",
        modal: `m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:rounded-b-2xl max-h-[85svh] min-w-[20rem] md:min-w-[30rem] ${getSize()}`,
      }}
      showCloseIcon={false}
      blockScroll={false}
    >
      {children}
    </Modal>
  );
};
