import { ReactNode } from "react";
import { IconType } from "react-icons";
import { IoClose } from "react-icons/io5";
import { ToastContentProps } from "react-toastify";

import { DetailsButton } from "./DetailsButton";
import { FloatingTopBar } from "./FloatingTopBar";
import { IconWrapper } from "./IconWrapper";
import { NotificationText } from "./NotificationText";
import { NotificationTitle } from "./NotificationTitle";

interface Props extends Partial<ToastContentProps> {
  title: string;
  text: string;
  actionComponent?: ReactNode;
  reactIcon: IconType;
}

export const Notification = ({
  closeToast,
  toastProps,
  title,
  text,
  actionComponent = <DetailsButton />,
  reactIcon,
}: Props) => {
  if (closeToast === undefined || toastProps === undefined) {
    throw new SyntaxError(
      "Notification should only be used with toast from react-toastify",
    );
  }
  return (
    <div>
      <FloatingTopBar type={toastProps.type} />
      <div className="flex flex-row justify-evenly items-start md:items-center gap-2">
        <IconWrapper ReactIcon={reactIcon} type={toastProps.type} />
        <div className="flex flex-col items-start gap-1">
          <NotificationTitle>{title}</NotificationTitle>
          <NotificationText>{text}</NotificationText>
          <div className="md:hidden">{actionComponent}</div>
        </div>
        <div className="hidden md:flex">{actionComponent}</div>
        <button
          className="text-[#AFAFAF] dark:text-[#E6EAEA]"
          onClick={closeToast}
        >
          <IoClose size={24} />
        </button>
      </div>
    </div>
  );
};
