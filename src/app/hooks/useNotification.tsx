import { FaCheck } from "react-icons/fa6";
import { LuBadgeCheck } from "react-icons/lu";
import { PiWarningCircleBold } from "react-icons/pi";
import { toast } from "react-toastify";

import { Notification } from "@/app/components/Notification/Notification";

const LoremText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const notifySuccess = (title: string, text: string = LoremText) => {
  toast.success(<Notification title={title} text={text} reactIcon={FaCheck} />);
};

export const notifyWraning = (title: string, text: string = LoremText) => {
  toast.warning(
    <Notification title={title} text={text} reactIcon={PiWarningCircleBold} />,
  );
};

export const notifyError = (title: string, text: string = LoremText) => {
  toast.error(
    <Notification title={title} text={text} reactIcon={PiWarningCircleBold} />,
  );
};

export const notifyInfo = (title: string, text: string = LoremText) => {
  toast.info(
    <Notification title={title} text={text} reactIcon={LuBadgeCheck} />,
  );
};
