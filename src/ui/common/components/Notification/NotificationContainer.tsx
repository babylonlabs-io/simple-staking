import { ToastContainer } from "react-toastify";
import { twJoin } from "tailwind-merge";

import { useIsMobileView } from "@/ui/common/hooks/useBreakpoint";

const commonClassName = "relative overflow-hidden rounded-lg px-4 py-3 md:p-3";

const BG_COLOR = {
  success:
    "dark:bg-[linear-gradient(0deg,rgba(73,177,73,0.1),rgba(73,177,73,0.1))] dark:bg-[#191919] bg-[linear-gradient(0deg,rgba(73,177,73,0.05),rgba(73,177,73,0.05))] bg-[#FFFFFF]",
  warning:
    "bg-[linear-gradient(0deg,rgba(197,136,45,0.05),rgba(197,136,45,0.05))] bg-[#FFFFFF] dark:bg-[linear-gradient(0deg,rgba(197,136,45,0.1),rgba(197,136,45,0.1))] dark:bg-[#191919]",
  error:
    "bg-[linear-gradient(0deg,rgba(221,100,100,0.05),rgba(221,100,100,0.05))] bg-[#FFFFFF] dark:bg-[linear-gradient(0deg,rgba(221,100,100,0.1),rgba(221,100,100,0.1))] dark:bg-[#191919]",
  info: "bg-[#FFFFFF] dark:bg-[#191919]",
  default: "bg-[#FFFFFF] dark:bg-[#191919]",
} as const;

export const NotificationContainer = () => {
  const isMobileView = useIsMobileView();

  return (
    <ToastContainer
      toastClassName={(context) => {
        return twJoin(commonClassName, BG_COLOR[context?.type ?? "default"]);
      }}
      autoClose={false}
      closeButton={false}
      icon={false}
      hideProgressBar={true}
      position={isMobileView ? "top-center" : "bottom-center"}
    />
  );
};
