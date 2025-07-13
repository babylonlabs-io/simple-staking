import { FaCheck } from "react-icons/fa6";
import { LuBadgeCheck } from "react-icons/lu";
import { PiWarningCircleBold } from "react-icons/pi";
import { toast } from "react-toastify";

import { Notification } from "@/ui/common/components/Notification/Notification";

export const notifySuccess = (title: string, text: string) => {
  toast.success(<Notification title={title} text={text} reactIcon={FaCheck} />);
};

export const notifyWraning = (title: string, text: string) => {
  toast.warning(
    <Notification title={title} text={text} reactIcon={PiWarningCircleBold} />,
  );
};

export const notifyError = (title: string, text: string) => {
  toast.error(
    <Notification title={title} text={text} reactIcon={PiWarningCircleBold} />,
  );
};

export const notifyInfo = (title: string, text: string) => {
  toast.info(
    <Notification title={title} text={text} reactIcon={LuBadgeCheck} />,
  );
};
